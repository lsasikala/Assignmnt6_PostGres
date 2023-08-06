const Sequelize = require('sequelize');

var sequelize = new Sequelize('txnmyeyn', 'txnmyeyn', '7YR3Ptff5Y6Ax3REYFWEsocs3x5iBnuc', {
    host: 'drona.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query:{ raw: true }
});

const Student = sequelize.define('student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING
});
const Course = sequelize.define('course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});
Course.hasMany(Student, { foreignKey: 'course' });

module.exports.initialize = function () {
    return new Promise( (resolve, reject) => {
        sequelize.sync()
            .then(() => {
                console.log('Database connection has been established successfully.');
                resolve(); //Success.  
            })
            .catch((err) => {
                console.error('Unable to sync the database:', err);
                reject('Unable to sync the database:');
                    
                })  
            })
        }


module.exports.getAllStudents = function(){
    return new Promise((resolve,reject)=>{
        Student.findAll()
            .then((students) => {
                if (students && students.length > 0) {
                    resolve(students); // Success: Return the array of students
                } else {
                    reject('No results returned'); // No students found
                }
            })
            .catch((err) => {
                console.error('Error retrieving students:', err);
                reject('Error retrieving students');
        
            });   
    });
}


module.exports.getCourses = function(){
   return new Promise((resolve,reject)=>{
    Course.findAll()
            .then((courses) => {
                if (courses && courses.length > 0) {
                    resolve(courses); // Success: Return the courses data
                } else {
                    reject('No results returned'); // No courses found
                }
            })
            .catch((err) => {
                console.error('Error retrieving courses:', err);
                reject('Error retrieving courses');
   });
});
}

module.exports.addStudent = function(studentData) {
    studentData.TA = studentData.TA ? true : false;

    // Replace blank values with null
    for (const key in studentData) {
        if (studentData[key] === "") {
            studentData[key] = null;
        }
    }
return new Promise((resolve, reject) => {
    Student.create(studentData)
    .then(() => {
        resolve(); // Success: Student created successfully
    })
    .catch((err) => {
        console.error('Error creating student:', err);
        reject('Unable to create student');
    });
});
}

module.exports.getStudentByNum = function (num) {
    return new Promise(function (resolve, reject) {
        Student.findAll({
            where: {
                studentNum: num
            }
        })
            .then((students) => {
                if (students && students.length > 0) {
                    resolve(students[0]); // Success: Return the first student object
                } else {
                    reject('No results returned'); // No student found for the specified studentNum
                }
            })
            .catch((err) => {
                console.error('Error retrieving student by studentNum:', err);
                reject('Error retrieving student by studentNum');    
    });
})
}

module.exports.getStudentsByCourse = function (course) {
    return new Promise((resolve, reject) =>  {
            Student.findAll({
                where: {
                    course: course
                }
            })
                .then((students) => {
                    if (students && students.length > 0) {
                        resolve(students); // Success: Return the array of students
                    } else {
                        reject('No results returned'); // No students found for the specified course
                    }
                })
                .catch((err) => {
                    console.error('Error retrieving students by course:', err);
                    reject('Error retrieving students by course');  
    })
})
 }

module.exports.getCourseById = function (id) {
    return new Promise((resolve,reject) => {
        Course.findAll(
        {
            where: {
                courseId: id
            }
        })
        .then((courses) => {
            if (courses && courses.length > 0) {
                resolve(courses[0]); // Success: Return the first course object
            } else {
                reject('No results returned'); // Course with the specified id not found
            }
        })
        .catch((err) => {
            console.error('Error retrieving course by id:', err);
            reject('Error retrieving course by id');
    });
});
}


module.exports.updateStudent = function (updatedStudent) {
    updatedStudent.TA = updatedStudent.TA ? true : false;
    for (const key in updatedStudent) {
        if (updatedStudent[key] === "") {
            updatedStudent[key] = null;
        }
    }
    return new Promise((resolve, reject) => {
        Student.update(updatedStudent, {
            where: {
                studentNum: updatedStudent.studentNum
            }
        })
        .then(() => {
            resolve(); //Student updated successfully.
        })
        .catch((err) => {
            console.error('Error updating student.', err);
            reject('Unable to update student.');
        });
    });
}
module.exports.addCourse = function (courseData) {
    courseData.courseCode = courseData.courseCode || null;
    courseData.courseDescription = courseData.courseDescription || null;

    return new Promise((resolve, reject) => {
        Course.create(courseData)
            .then(() => {
                resolve(); // Success. Course created successfully.
            })
            .catch((err) => {
                console.error('Error creating course.', err);
                reject('Unable to create course.');
            });
    });
};

/*module.exports.updateCourse = function (updatedCourse) {
    updatedCourse.TA = updatedCourse.TA ? true : false;
    for (const key in updatedCourse) {
        if (updatedCourse[key] === "") {
            updatedCourse[key] = null;
        }
    }

    return new Promise((resolve, reject) => {
        Course.update(updatedCourse, {
            where: {
                courseId: updatedCourse.courseId
            }
        })
        .then(() => {
            resolve(); // Course updated successfully.
        })
        .catch((err) => {
            console.error('Error updating course.', err);
            reject('Unable to update course.');
        });
    });
};
*/
module.exports.updateCourse = function (courseData) {
    console.log("Updating course with data:", courseData); // Debugging line
    if (isNaN(parseInt(courseData.courseId))) {
        return Promise.reject('Invalid courseId');
    }

    for (const key in courseData) {
        if (courseData[key] === "") {
            courseData[key] = null;
        }
    }
    
    return new Promise((resolve, reject) => {
        Course.update(courseData, {
            where: {
                courseId: courseData.courseId
            }
        })
        .then(() => {
            return Course.findByPk(courseData.courseId);
        })
        .then(updatedCourse => {
            resolve(updatedCourse);
        })
        .catch((err) => {
            console.error('Error updating course.', err);
            reject('Unable to update course.');
        });
    });
};
module.exports.addCourse = function (courseData) {
    // Replace empty strings with null values
    for (const key in courseData) {
        if (courseData[key] === "") {
            courseData[key] = null;
        }
    }

    return new Promise((resolve, reject) => {
        // Create the course in the database
        Course.create(courseData)
            .then(() => {
                resolve(); // Success. Course created successfully.
            })
            .catch((err) => {
                console.error('Error creating course.', err);
                reject('Unable to create course.');
            });
    });
};
module.exports.updateCourse = function (courseData) {
    // Replace empty strings with null values
    for (const key in courseData) {
        if (courseData[key] === "") {
            courseData[key] = null;
        }
    }

    return new Promise((resolve, reject) => {
        // Update the course in the database
        Course.update(courseData, {
            where: {
                courseId: courseData.courseId
            }
        })
            .then(() => {
                resolve(); // Success. Course updated successfully.
            })
            .catch((err) => {
                console.error('Error updating course.', err);
                reject('Unable to update course.');
            });
    });
};
module.exports.deleteCourseById = function (id) {
    return new Promise((resolve, reject) => {
        // Delete the course from the database
        Course.destroy({
            where: {
                courseId: id
            }
        })
        .then((rowsDeleted) => {
            if (rowsDeleted === 0) {
                // If no rows were deleted, the course with the given ID was not found.
                reject('Course not found.');
            } else {
                resolve(); // Success. Course deleted successfully.
            }
        })
        .catch((err) => {
            console.error('Error deleting course.', err);
            reject('Unable to delete course.');
        });
    });
};

module.exports.deleteStudentByNum = function(studentNum){
    return new Promise((resolve, reject) => {
        Student.destroy({
          where: { studentNum: studentNum }
        })
        .then((rowsDeleted) => {
          if (rowsDeleted === 1) {
            resolve("Student deleted successfully.");
          } else {
            reject(new Error("Student not found or could not be deleted."));
          }
        })
        .catch((err) => {
          reject(err);
        });
      });
}


Object.assign(module.exports, {
    sequelize: sequelize,
    Student: Student,
    Course: Course
});






