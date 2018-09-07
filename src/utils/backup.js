// backup/restore functions

import db from '../fire';

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

            // Write collection to JSON file
            //   fs.writeFile("firestore-export.json", JSON.stringify(dt), function(err) {
            //       if(err) {
            //           return console.log(err);
            //       }
            //       console.log("The file was saved!");
            //   });

            resolve(data);
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
