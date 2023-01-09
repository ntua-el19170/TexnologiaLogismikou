import express from 'express'
import mysql from 'mysql2'

const app = express();

const PORT = 9103;
const baseUrl = '/intelliq_api';

app.use(express.json());

app.listen(PORT,() => console.log(`server running on PORT: ${PORT}`))

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: '3306',
    password: '',
    database: 'que_database'
}).promise();



app.get(baseUrl,(req,res)=>{
    res.send('welcome to intelliq')
});



//e
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


//d
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





//admin4
app.post(`${baseUrl}/admin/resetq/:questionnaireID`, async (req, res) => {
    const questionnaireId = req.params.questionnaireID;

    try {
        await connection.connect();
        await connection.query(`DELETE FROM answer WHERE questionnaire_id='${questionnaireId}' `)

        
        res.send(
            {
                "Status": `Deleted every answer from questionnaire ${questionnaireId}`
            })
    }
    catch(error) {
        res.status(500).send({ error: `Can't delete \n ${error}` });
    }
})


//admin3
app.post(`${baseUrl}/admin/resetall`, async (req, res) => {

    try {
        await connection.connect();
        await connection.query(`DELETE FROM answer`)
        await connection.query(`DELETE FROM Q_Session`)
        
        res.send(
            {
                "Status": "System initialized"
            })
    }
    catch(error) {
        res.status(500).send({ error: `Can't initialize \n ${error}` });
    }
})


