import express from 'express'
import mysql from 'mysql2'
import multer from 'multer'
import fs from "fs";

const app = express();

const PORT = 9103;
const baseUrl = '/intelliq_api';
const upload = multer();

app.use(express.json());

app.listen(PORT,() => console.log(`server running on PORT: ${PORT}`))

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: '4321',
    password: '12345',
    database: 'que_database'
}).promise();



app.get(baseUrl,(req,res)=>{
    res.send('welcome to intelliq')
});

app.get(`${baseUrl}/questionnaires`, async (req, res) => {
    try {
        await connection.connect()
        let questionnaires = await connection
            .query(`SELECT * FROM Questionnaire`);
        res.send(questionnaires[0]);
    }
    catch(error) {
        res.send({"error":"Failed to get questionnaires"})
    }
})


// ADMIN 1
app.get(`${baseUrl}/admin/healthcheck`, async (req, res) => {
    let connectionString;
    try {
        await connection.connect()
        connectionString = `server=${connection.config.host};user id=${connection.config.user};password=${connection.config.password};database=${connection.config.database}`;
        res.send({"status":"OK", "dbconnection": connectionString});
    }
    catch(error) {
        connectionString = `server=${connection.config.host};user id=${connection.config.user};password=${connection.config.password};database=${connection.config.database}`;
        res.send({"status":"failed", "dbconnection": connectionString})
    }
})
// ADMIN 2
app.post(`${baseUrl}/admin/questionnaire_upd`, upload.single('file'), async (req, res) => {
    try {
        await connection.connect();
        const jsonString = req.file.buffer.toString('utf8');
        const QQ = JSON.parse(jsonString);
        await connection.query(`INSERT INTO Questionnaire VALUES ('${QQ.questionnaireID}', '${QQ.questionnaireTitle}','${QQ.keywords.join(',')}')`);
        for(let question of QQ.questions) {
            await connection.query(`INSERT INTO Question VALUES ('${question.qID}', '${question.qtext}','${question.required}','${question.type}','${QQ.questionnaireID}')`);
        }
        for(let question of QQ.questions) {
            for(let option of question.options) {
                await connection.query(`INSERT INTO Q_Option VALUES ('${option.optID}', '${option.opttxt}','${question.qID}',${option.nextqID=='-' ? null : `'${option.nextqID}'`},'${QQ.questionnaireID}')`)
            }
        }
        res.send({status:'success'})
    }
    catch(error) {
        res.send(`Failed to upload questionnaire, error: ${error}`)
    }
})
// ADMIN 3
app.post(`${baseUrl}/admin/resetall`, async (req, res) => {

    try {
        await connection.connect();
        await connection.query(`DELETE FROM Answer`)
        await connection.query(`DELETE FROM Q_Session`)
        await connection.query(`DELETE FROM Q_Option`)
        await connection.query(`DELETE FROM Question`)
        await connection.query(`DELETE FROM Questionnaire`)
        res.send(
            {
                "Status": "OK"
            })
    }
    catch(error) {
        res.status(500).send({'Status':'failed','reason':error});
    }
})
// ADMIN 4
app.post(`${baseUrl}/admin/resetq/:questionnaireID`, async (req, res) => {
    const questionnaireId = req.params.questionnaireID;

    try {
        await connection.connect();
        await connection.query(`DELETE FROM answer WHERE questionnaire_id='${ req.params.questionnaireID}' `)


        res.send(
            {
                "Status": `Deleted every answer from questionnaire ${questionnaireId}`
            })
    }
    catch(error) {
        res.status(500).send({ error: `Can't delete \n ${error}` });
    }
})
// a
app.get(`${baseUrl}/questionnaire/:questionnaireID`, async (req, res) => {
    const questionnaireId = req.params.questionnaireID;
    try {
        await connection.connect();
        let questions = await connection.query(`SELECT * FROM Question WHERE questionnaire_id = '${questionnaireId}'`);
        questions = questions[0];
        let questionList = [];
        for(const question of questions) {
            questionList.push(
                {
                    "qID": question.question_id,
                    "qtext": question.question_text,
                    "required": question.required,
                    "type": question.q_type
                }
            )
        }
        const questionnaire = await connection.query(`SELECT * FROM Questionnaire WHERE questionnaire_id = '${questionnaireId}'`);
        let questionnaireTitle = questionnaire[0][0].title;
        let keywords = questionnaire[0][0].keywords.split(',');
        res.send({"questionnaireID": questionnaireId, "questionnaireTitle":questionnaireTitle,"keywords":keywords, "questions": questionList});
    }
    catch(error) {
        res.status(402).send({ error: "Could not get questionnaire" });
    }
})
// b
app.get(`${baseUrl}/question/:questionnaireID/:questionID`, async (req, res) => {
    const questionnaireId = req.params.questionnaireID;
    const questionId = req.params.questionID;
    try {
        await connection.connect();
        let question = await connection
            .query(`SELECT * FROM Question
         WHERE questionnaire_id = '${questionnaireId}' AND question_id = '${questionId}'`);
        question = question[0][0];
        let options = await connection
            .query(`SELECT * FROM Q_Option o 
                        INNER JOIN Question q ON o.question_id = q.question_id 
                        WHERE o.question_id = '${questionId}' AND q.questionnaire_id = '${questionnaireId}';`)
        let optionList = [];
        for(const option of options[0]) {
            optionList.push(
                {
                    "optID": option.option_id,
                    "opttxt": option.option_text,
                    "nextqID": option.next_q_id,
                }
            )
        }
        res.send(
            {
                "questionnaireID": questionnaireId,
                "qID": questionId,
                "qtext": question.question_text,
                "required": question.required,
                "type": question.q_type,
                "options": optionList,
            });
    }
    catch(error) {
        res.status(400).send({ error: `Could not get question: ${error}` });
    }
})
// c
app.post(`${baseUrl}/doanswer/:questionnaireID/:questionID/:session/:optionID`, async (req, res) => {
    const questionnaireId = req.params.questionnaireID;
    const questionId = req.params.questionID;
    const sessionId = req.params.session;
    const optionId = req.params.optionID;
    try {
        await connection.connect();
        const sessionFind = await connection.query(`SELECT * FROM Q_Session WHERE session_id = '${sessionId}'`)
        if(sessionFind[0].length===0){
            await connection.query(`INSERT INTO Q_Session VALUES ('${sessionId}','${Date().toString()}','FALSE','${questionnaireId}')`)
        }
        const answerExists = await connection.query(`SELECT * FROM Answer WHERE session_id = '${sessionId}' AND question_id = '${questionId}'`)
        if(answerExists[0].length===0){
            const result = await connection.query(`INSERT INTO Answer VALUES (default,'${sessionId}','${questionId}','${optionId}','${questionnaireId}')`)
            res.send(result)
        }
        else throw 'Already in database';
    }
    catch(error) {
        res.status(500).send({ error: `Could not submit answer \n ${error}` });
    }
})
// d
app.get(`${baseUrl}/getsessionanswers/:questionnaireID/:session`, async (req, res) => {
    const questionnaireId = req.params.questionnaireID;
    const sessionId = req.params.session;

    try {
        await connection.connect();
        const wansFind = await connection.query(`SELECT * FROM answer WHERE session_id = '${sessionId}' and questionnaire_id='${questionnaireId}' order by question_id`)

        console.log(wansFind[0])
        let w_answerList = [];

        for(const answer of wansFind[0]) {
            w_answerList.push(
                {
                    "qID": answer.question_id,
                    "ans": answer.option_id,
                }
            )
        }

        res.send(
            {
                "questionnaireID": questionnaireId,
                "session": sessionId,
                "answers": w_answerList
            })
    }
    catch(error) {
        res.status(500).send({ error: `Can't get answers \n ${error}` });
    }
})
// e
app.get(`${baseUrl}/getquestionanswers/:questionnaireID/:questionID`, async (req, res) => {
    const questionnaireId = req.params.questionnaireID;
    const questionId = req.params.questionID;

    try {
        await connection.connect();
        const ansFind = await connection.query(`SELECT * FROM answer WHERE question_id = '${questionId}' and questionnaire_id='${questionnaireId}' `)

        console.log(ansFind[0])
        let answerList = [];

        for(const answer of ansFind[0]) {
            answerList.push(
                {
                    "session_id": answer.session_id,
                    "optID": answer.option_id,
                }
            )
        }

        res.send(
            {
                "questionnaireID": questionnaireId,
                "qID": questionId,
                "answers": answerList
            })
    }
    catch(error) {
        res.status(500).send({ error: `Can't get answers \n ${error}` });
    }
})

// use-case_1 endpoint

app.get(`${baseUrl}/showsessionanswers/:sessionID`, async (req, res) => {
    const sessionId = req.params.sessionID;
    try {
        await connection.connect();
        const sessionData = await connection.query(`SELECT session_id, question_id, option_id, questionnaire_id FROM answer WHERE session_id = '${sessionId}'`)
        let qAndAList = [];
        for(const question of sessionData[0]) {
            let questionData = await connection.query(`SELECT question_text FROM question WHERE question_id = '${question.question_id}'`)
            let optionData = await connection.query(`SELECT option_text FROM q_option WHERE option_id = '${question.option_id}'`)
            qAndAList.push(
                {
                    question: questionData[0][0].question_text,
                    answer: optionData[0][0].option_text,
                }
            )
        }
        res.send(qAndAList)
    }
    catch(error) {
        res.status(500).send({ error: `Can't get summary \n ${error}` });
    }
})


// use-case_2 endpoint

app.get(`${baseUrl}/questionstats/:questionnaire_ID/:question_ID`, async (req, res) => {
    const questionnaire_Id = req.params.questionnaire_ID;
    const question_Id = req.params.question_ID;
    try {
        await connection.connect();
        const allOptions = await connection.query(`SELECT option_id, option_text FROM q_option WHERE question_id = '${question_Id}' AND questionnaire_id = '${questionnaire_Id}'`)
        console.log(allOptions[0])
        const totalCount = await connection.query(`SELECT COUNT(answer_id) AS totalCount FROM answer WHERE question_id = '${question_Id}' AND questionnaire_id = '${questionnaire_Id}'`)
        let summary = [];
        for(const option of allOptions[0]) {
            console.log(option.option_id)
            let optionCount = await connection.query(`SELECT COUNT(answer_id) AS countans FROM answer WHERE question_id = '${question_Id}' AND questionnaire_id = '${questionnaire_Id}' AND option_id = '${option.option_id}'`)
            summary.push({
                option: option.option_text,
                // count: totalCount[0][0].totalCount
                percentage: totalCount[0][0].totalCount !== 0 ? (optionCount[0][0].countans/totalCount[0][0].totalCount * 100).toString()+'%' : '0%'
            })
        }
        res.send(summary)
    }
    catch(error) {
        res.status(500).send({ error: `Can't get summary \n ${error}` });
    }
})