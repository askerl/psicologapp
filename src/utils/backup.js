// backup/restore functions

import db, { backupRef } from '../fire';
import moment from 'moment';
import { backupDateFormat } from '../config/constants';

// require('fs-extra');

export const backup = () => {
    let promise = new Promise( (resolve, reject) => {

        let data = {};

        // inicializo colecciones
        data['pacientes'] = {};
        data['sesiones'] = {};

        console.log('Respaldando...');

        backupCollection('pacientes').then(pacientes => {
            data['pacientes'] = pacientes;
        }).then(backupCollection('sesiones').then(sesiones => {
            data['sesiones'] = sesiones;
            console.log('Respaldo', data);

            let fileName = `backup-${moment().format(backupDateFormat)}.json`;
            console.log('Filename:',fileName);
            
            let fileRef = backupRef.child(fileName);
            
            // File path is 'images/space.jpg'
            let path = fileRef.fullPath
            
            // File name is 'space.jpg'
            let name = fileRef.name

            fileRef.putString(JSON.stringify(data)).then(function(snapshot) {
                console.log('Respaldo subido...');
                resolve(data);
            });
            
        })).catch(error => {
            console.log(error);
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
            console.log(collectionName, colData);
            resolve(colData);
        }).catch( error => {
            reject(error);
        });

    });
    return promise;
}
