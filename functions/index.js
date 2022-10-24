const functions = require("firebase-functions");
const {getAuth} = require('firebase-admin/auth');
const admin = require('firebase-admin');


admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

//req contians an email ,password, fname, lname
// this does not have to be hooked up to the frontend
exports.register = functions.https.onRequest((req, res) => {
    // idk if this is needed
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
        return;
    }
    data = req.body;

    getAuth().createUser({
        email: data.email,
        password: data.password
      }).then((userRecord) => {
        admin.firestore().doc(`Students/${userRecord.uid}`).set({fname: data.fname, lname: data.lname});
      }).catch((error) => { console.log(error); return error;})
    res.json("created user");
});


// will do later
exports.signin = functions.https.onRequest((req, res) => {// idk if this is needed
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
        return;
    }

    data = req.body;
    


})


// returns an array with the degree names. req does not need to contain anything
exports.getDegrees = functions.https.onRequest(async (req, res) => {
    // idk if this is needed
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
        return;
    }

    data = req.body;

    // no idea why this await has to be here, but it does
    res.json(Object.keys(await (await admin.firestore().doc(`Courses/Majors`).get()).data()));
})

// req requires a course_name, it should be identical to the course names from getDegrees
// reqturns an array of strings containing the names of majors
exports.getMajorNames = functions.https.onRequest((req, res) => {
    // idk if this is needed
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
        return;
    }
    data = req.body;

    admin.firestore().doc(`Courses/Majors`)
        .get()
        .then((courses) => {
            let course_data = courses.data()
            res.json(Object.keys(course_data[data.course_name]));
        })
        .catch((error) => {
            console.log(error);
            res.json(error)
        });
})

// To be completed
// exports.getCourse = functions.https.onRequest((req, res) => {
    // // idk if this is needed
    // res.set('Access-Control-Allow-Origin', '*');
    // if (req.method === 'OPTIONS') {
    //     // Send response to OPTIONS requests
    //     res.set('Access-Control-Allow-Methods', 'POST');
    //     res.set('Access-Control-Allow-Headers', 'Content-Type');
    //     res.set('Access-Control-Max-Age', '3600');
    //     res.status(204).send('');
    //     return;
    // }
//     data = req.body;

//     admin.firestore().doc(`Courses/Majors`)
//         .get()
//         .then((courses) => {
//             let course_data = courses.data()
//             res.json(Object.keys(course_data[data.course_name]));
//         })
//         .catch((error) => {
//             console.log(error);
//             res.json(error)
//         });
// })

exports.getSubjects = functions.https.onRequest(async (req, res) => {
    // idk if this is needed
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
        return;
    }
    data = req.body;

    // still don't know why this works
    res.json(await (await admin.firestore().doc(`Courses/Subjects`).get()).data());
})

// You should not call this function, or any of the "import" functions, as it changes data
// takes coursedata.json from the course scraper repo, cleans up subjects by removing non-subject text
// then modifies the data in firebase
exports.importCourses = functions.https.onRequest((req, res) => {
    // idk if this is needed
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
        return;
    }
    data = req.body;

    delete data.subjects;

    let session_copy = [];

    for(course in data)
    {
        //console.log(course);
        for(const major in data[course])
        {
            for(const year in data[course][major])
            {
                console.log(year);
                for(let session in data[course][major][year])
                {
                    session_copy = [];
                    
                    for(const subject of data[course][major][year][session])
                    {
                        console.log(subject);
                        if(subject.match(/^\d/)){
                            session_copy.push(subject);
                            console.log("code runs");
                        }
                    }
                    data[course][major][year][session] = session_copy;
                }
            }
        }
    }

    admin.firestore().doc('Courses/Majors').set(data);

    res.json("done");
})
// You should not call this function
exports.importSubjects = functions.https.onRequest((req, res) => {
    // idk if this is needed
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
        return;
    }
    data = req.body;

    admin.firestore().doc('Courses/Subjects').set(data.subjects);

    res.json("done");
})


