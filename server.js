/*********************************************************************************
*  WEB700 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: LAVANYA SASIKALA Student ID: 156621211 Date: 07/08/2023
********************************************************************************/ 

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var exphbs = require("express-handlebars");
var path = require("path");
var collegeData = require("./modules/collegeData.js");  //importing collegeData.js module.
var app = express();





app.engine('.hbs', exphbs.engine(
    { extname: '.hbs',
      defaultLayout: 'main',
      helpers:{
      navLink: function(url, options){
        return '<li' + 
            ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
            '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    }
}
}


));

app.set('view engine', '.hbs');

//app.set("views", path.join(__dirname, "views"));


app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));   // Body-parser middleware

// setup a 'route' to listen on the default url path
app.get("/students", (req, res) => {
    // Retrieving all students
    collegeData.getAllStudents()
    .then((students)=>{
        if(req.query.course){
            //If query parameter course is provided, filter students by course.
            return collegeData.getStudentsByCourse(parseInt(req.query.course));
        }
        else{
            //If no query parameter, return all students
            return students;
        }
    })
    .then((filteredStudents)=>{
        if(filteredStudents.length===0){
            //If no data found, render "students" view with he message e "No results found".
            res.render("students",{message:"No results found"});
        } else{
            //Render students view with the students data.
            res.render("students",{students:filteredStudents});
        }
    })
    .catch((err)=> {
        //If an error occured,  "students" view with he message e "No results found".
        res.render("students",{message:"Error retrieving students.",err});
    });
    
});

app.get("/courses",(req,res) =>{
    collegeData.getCourses()
    //Retrieve courses
    .then((courses) => {
        if(courses.length === 0) {
            res.render("courses", { message: "No results found" })
        }
        else {

        //Return the courses
        res.render("courses", {courses:courses });
    }
    })
    .catch(() => {
        //If an error occurs, return the error message.
        res.render("courses",{ message : "Error retrieving courses"});
    });
});

/*app.get("/student/:num", (req,res) =>{
    const studentNum = req.params.num;
    //retrieve the student number from the request and gte the student by the number.
    collegeData.getStudentByNum(studentNum)
    .then(student => {
        //Return the student number.
        res.render("student", {student});
    })
    .catch(() => {
        //If error, return a message.
        res.render("student", {message : "Student Not Found"});
    });
    
});
*/
app.get("/student/:studentNum", (req, res) => {

    // initialize an empty object to store the values
    let viewData = {};

    collegeData.getStudentByNum(req.params.studentNum).then((student) => {
        if (student) {
            viewData.student = student; //store student data in the "viewData" object as "student"
        } else {
            viewData.student = null; // set student to null if none were returned
        }
    }).catch(() => {
        viewData.student = null; // set student to null if there was an error 
    }).then(collegeData.getCourses)
    .then((courses) => {
        viewData.courses = courses; // store course data in the "viewData" object as "courses"

        // loop through viewData.courses and once we have found the courseId that matches
        // the student's "course" value, add a "selected" property to the matching 
        // viewData.courses object

        for (let i = 0; i < viewData.courses.length; i++) {
            if (viewData.courses[i].courseId == viewData.student.course) {
                viewData.courses[i].selected = true;
            }
        }

    }).catch(() => {
        viewData.courses = []; // set courses to empty if there was an error
    }).then(() => {
        if (viewData.student == null) { // if no student - return an error
            res.status(404).send("Student Not Found");
        } else {
            res.render("student", { viewData: viewData }); // render the "student" view
        }
    });
});


/*app.get("/course/:id", (req,res) => {
    const courseId =req.params.id;
    collegeData.getCourseById(courseId)
    .then((course) => {
        if (!course) {
            res.status(404).send("Course Not Found");
        } else {
        console.log(course);
    res.render("course",{course});
        }
    })
    .catch((error) => {
        console.log(error);
        res.render("course", {message: error});
    });
});
*/

app.get("/student/delete/:studentNum", (req, res) => {
    const studentNum = req.params.studentNum;
  
    collegeData.deleteStudentByNum(studentNum)
      .then(() => {
        // If the student is deleted successfully, redirect to "/students" view.
        res.redirect("/students");
      })
      .catch((error) => {
        // If there was an error during the deletion process, return a status code of 500 and an error message.
        res.status(500).send("Unable to Remove Student / Student not found");
      });
  });
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));    
    next();
});

app.get ("/", (req,res) =>{
    //const filePath = path.join(__dirname,"views","home.html");  //File path for home.html
    res.render("home");
});
app.get("/about", (req,res) =>{
    //const filePath = path.join(__dirname,"views","about.html");   //File path for about.html
    res.render("about");
});
app.get("/htmlDemo", (req,res) =>{
    //const filePath = path.join(__dirname,"views","htmlDemo.html");  //File path for htmlDemo.html
    res.render("htmlDemo");
});
app.get("/students/add", (req, res) => {
    //const filePath = path.join(__dirname, "views", "addStudent.html");   //File path for addStudent.html
    collegeData
    .getCourses()
    .then((courses) => {
      res.render("addStudent", { courses: courses });
    })
    .catch((err) => {
      res.render("addStudent", { courses: [] });
    });
  });

  app.get("/courses/add", (req, res) => {
    res.render("addCourse"); // Render the "addCourse" view
});

app.post("/students/add", (req, res) => {
    const studentData = req.body;
  
    collegeData.addStudent(studentData)     //Calling addStudent function from collegeData module to add the student
      .then(() => {
        res.redirect("/students");         //If successfully added, redirect to the /students page
      })
      .catch((err) => {
        res.status(500).json({ error: err });  //If not, dispaly the error message.
      });
  });
  app.post("/courses/add", (req, res) => {
    const courseData = req.body; // Get the submitted form data

    // Ensure that any blank values in courseData are set to null
    for (const key in courseData) {
        if (courseData[key] === "") {
            courseData[key] = null;
        }
    }
    collegeData.addCourse(courseData) // Call the addCourse function with the data
    .then(() => {
        console.log("Course added successfully");
        res.redirect("/courses"); // Redirect to the /courses page after adding the course
    })
    .catch((error) => {
        console.error("Error adding course:", error.message);
        res.redirect("/courses"); // Redirect to the /courses page if there was an error
    });
});
app.post("/course/update", (req, res) => {
    console.log(req.body); 
    const updatedCourse = req.body; // Get the submitted form data

    // Ensure that any blank values in updatedCourse are set to null
    for (const key in updatedCourse) {
        if (updatedCourse[key] === "") {
            updatedCourse[key] = null;
        }
    }
    collegeData.updateCourse(updatedCourse) // Call the updateCourse function with the data
    .then(() => {
        console.log("Course updated successfully");
        res.redirect("/courses"); // Redirect to the /courses page after updating the course
    })
    .catch((error) => {
        console.error("Error updating course:", error.message);
        res.redirect("/courses"); // Redirect to the /courses page if there was an error
    });
});
app.get("/course/:id", (req, res) => {
    const courseId = req.params.id;

    collegeData.getCourseById(courseId)
        .then((course) => {
            if (!course) {
                res.status(404).send("Course Not Found");
            } else {
                res.render("course", { course });
            }
        })
        .catch((error) => {
            console.error(error);
            res.render("course", { message: "Error retrieving course" });
        });
});
app.get("/course/delete/:id", (req, res) => {
    const courseId = req.params.id;

    collegeData.deleteCourseById(courseId)
        .then(() => {
            res.redirect("/courses");
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send("Unable to Remove Course / Course not found");
        });
});




app.post("/student/update", (req, res) => {
    const updatedStudent = req.body; // Get the submitted form data
    console.log("Received updated student data:", updatedStudent);
  
    collegeData.updateStudent(updatedStudent) // Call the updateStudent function with the data
      .then(() => {
        console.log("Student updated successfully");
        res.redirect("/students");
      })
      .catch((error) => {
        console.error("Error updating student:", error.message);
        res.redirect("/students");
      });
  });


app.use((req,res) =>{
    res.status(404).send("Page Not Found");    //Message if there is no matching routes
});

// setup http server to listen on HTTP_PORT
collegeData.initialize()
.then(() =>{
    app.listen(HTTP_PORT,()=>{console.log("Server listening on port:"+HTTP_PORT)
});
})
.catch((err) => {

    console.error("Error initializin data.",err);   //Message to dispaly if the data initialization fails.
});
