// backup/restore functions

import db, { backupRef } from '../fire';
import moment from 'moment';
import { backupDateFormat } from '../config/constants';
import { setSession, getSession, deleteFile } from './utils';
import { env } from '../config/envs';
import axios from 'axios';

export const getRespaldos = () => {
    let promise = new Promise( (resolve, reject) => {

        // chequeo si ya tengo respaldos cargados en sesion (cache)
        let respaldos = getSession('respaldos');

        if (respaldos) {
            console.log('Respaldos cache', respaldos);
            resolve(respaldos);
        } else {
            db.collection("respaldos").orderBy("fecha","desc").get().then( querySnapshot => {
                let respaldos = [];
                querySnapshot.docs.forEach( doc => {
                    let respaldo = doc.data();
                    respaldo.id = doc.id;
                    respaldos.push(respaldo);
                });
                // almaceno pacientes en sesion para cache
                console.log('Respaldos DB', respaldos);
                setSession('respaldos',respaldos);
                resolve(respaldos);
            });
        }
    });
    return promise;
};

export const backupData = () => {
    let promise = new Promise( (resolve, reject) => {

        let fechaBackup = moment();

        let fileName = `backup-${env}-${fechaBackup.format(backupDateFormat)}.json`,
            fileRef = backupRef.child(fileName);

        // inicializo backup
        let backup = {
            nombre: fileName,
            data: {
                pacientes: {},
                sesiones: {}
            }
        };

        backupCollection('pacientes').then(pacientes => {
            // guardo datos de pacientes
            backup.data['pacientes'] = pacientes;
            backupCollection('sesiones').then(sesiones => {
                // guardo datos de sesiones
                backup.data['sesiones'] = sesiones;
                // guardo archivo en Cloud Storage
                fileRef.putString(JSON.stringify(backup)).then( snapshot => {
                    // Update metadata properties
                    fileRef.updateMetadata({contentType: "application/json"}).then( metadata => {
                        let respaldo = {
                            nombre: metadata.name,
                            fecha: new Date(
                                fechaBackup.year(), fechaBackup.month(), fechaBackup.date(),
                                fechaBackup.hour(), fechaBackup.minute(), fechaBackup.second()
                            ),
                            size: metadata.size,
                            pacientes: Object.keys(backup.data['pacientes']).length,
                            sesiones: Object.keys(backup.data['sesiones']).length,
                            url: metadata.downloadURLs[0] 
                        };
                        // guardo respaldo en DB
                        db.collection("respaldos").add(respaldo).then( docRef => {
                            resolve();
                        }).catch( error => {
                            console.error("Error guardando respaldo: ", error);
                            reject(error);
                        });
                    }).catch( error => {
                        console.log('Error obteniendo URL de archivo: ', error);
                        reject(error);
                    });
                }).catch( error => {
                    console.log('Error guardando respaldo en DB: ', error);
                    reject(error);
                });
            }).catch(error => {
                console.log('Error respaldando Sesiones: ', error);
                reject(error);
            });
        }).catch(error => {
            console.log('Error respaldando Pacientes: ', error);
            reject(error);
        });
    });
    return promise;
};

const backupCollection = (collectionName) => {
    let promise = new Promise( (resolve, reject) => {
        let colData = {};
        db.collection(collectionName).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                colData[doc.id] = doc.data();
            })
            resolve(colData);
        }).catch( error => {
            reject(error);
        });

    });
    return promise;
};

export const deleteBackup = (idBackup, fileName) => {
    let promise = new Promise( (resolve, reject) => {
        // borro registro del respaldo
        db.collection("respaldos").doc(idBackup).delete().then( () => {
            // borro archivo
            deleteFile(fileName).then( () => {
                resolve();         
            }).catch( error => {
                // si no pude borrar el archivo aviso con advertencia
                resolve(error);
            });
        }).catch( error => {
            reject(error); 
        });
    });
    return promise;
}

export const restoreBackup = (idBackup, fileName) => {
    let promise = new Promise( (resolve, reject) => {
        
        backupRef.child(fileName).getDownloadURL().then( url => {
            axios({
                url: url,
                method: 'GET',
                responseType: 'json' // important
            }).then((response) => {
                let backupData = response.data.data;
                console.log('backupData', backupData);
                // Get a new write batch
                let batch = db.batch();
                for (let collectionName in backupData) {
                    console.log('col', collectionName);
                    for (let doc in backupData[collectionName]) {
                        console.log(doc);
                        if (backupData[collectionName].hasOwnProperty(doc)) {
                            console.log(backupData[collectionName][doc]);
                            let docRef = db.collection(collectionName).doc(doc);
                            batch.set(docRef, backupData[collectionName][doc], {merge: true});                            
                        }
                    }
                }
                //Commit the batch
                batch.commit().then(() => {
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        }).catch(error => {
            reject(error);
        });
        
    });
    return promise;
}
