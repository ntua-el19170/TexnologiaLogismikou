import { Command } from 'commander';
import axios from "axios";
import fs from "fs";
import json2csv from 'json2csv'
import FormData from 'form-data'

const program = new Command();
program.command('healthcheck')
    .action(
        async () => {
            const status = await axios.get('http://localhost:9103/intelliq_api/admin/healthcheck');
            console.log(status.data);
        }
    )

program.command('resetall')
    .action(
        async () => {
            const status = await axios.post('http://localhost:9103/intelliq_api/admin/resetall');
            console.log(status.data);
        }
    )

program.command('questionnaire_upd')
    .requiredOption('-s, --source <file>')
    .action(
        async (options) => {
            const questionnaire_file = fs.readFileSync(options.source, 'utf8');
            const questionnaire = JSON.parse(questionnaire_file)
            console.log(questionnaire)
            const formData = new FormData();
            formData.append('file', fs.createReadStream(options.source));

            const headers = {
                'Content-Type': 'multipart/form-data',
                ...formData.getHeaders(),
            };
            const status = await axios.post('http://localhost:9103/intelliq_api/admin/questionnaire_upd', formData, { headers });
            console.log(status.data);
        }
    )

program.command('resetq')
    .requiredOption('-p, --questionnaire_id <value>')
    .action(
        async (options) => {
            console.log(options.questionnaire_id)
            const status = await axios.post(`http://localhost:9103/intelliq_api/admin/resetq/${options.questionnaire_id}`);
            console.log(status.data);
        }
    )

program.command('questionnaire')
    .requiredOption('-p, --questionnaire_id <value>')
    .option('-f, --format <value>')
    .action(
        async (options) => {
            console.log(options.questionnaire_id)
            const status = await axios.get(`http://localhost:9103/intelliq_api/questionnaire/${options.questionnaire_id}`).catch((error)=>{
                console.log(error);
                return;
            });
            if(options.format === undefined || options.format === 'json') {
                console.log(status.data);
            }
            else if(options.format === 'csv') {
                const csvTransformed = questionnaireJsonToCsv(status.data)
                console.log(csvTransformed)
            }
            else {
                console.log('invalid format requested: ',options.format)
            }
        }
    )

program.command('question')
    .requiredOption('-p, --questionnaire_id <value>')
    .requiredOption('-p, --question_id <value>')
    .option('-f, --format <value>')
    .action(
        async (options) => {
            const status = await axios.get(`http://localhost:9103/intelliq_api/question/${options.questionnaire_id}/${options.question_id}`).catch((error)=>{
                console.log(error);
                return;
            });
            if(options.format === undefined || options.format === 'json') {
                console.log(status.data);
            }
            else if(options.format === 'csv') {
                const csvTransformed = questionJsonToCsv(status.data)
                console.log(csvTransformed)
            }
            else {
                console.log('invalid format requested: ',options.format)
            }
        }
    )

program.command('doanswer')
    .requiredOption('-p, --questionnaire_id <value>')
    .requiredOption('-p, --session_id <value>')
    .requiredOption('-p, --question_id <value>')
    .requiredOption('-p, --option_id <value>')
    .action(
        async (options) => {
            console.log(options)
            const status = await axios.post(`http://localhost:9103/intelliq_api/doanswer/${options.questionnaire_id}/${options.question_id}/${options.session_id}/${options.option_id}`);
            console.log(status.data);
        }
    )

program.command('getsessionanswers')
    .requiredOption('-p, --questionnaire_id <value>')
    .requiredOption('-p, --session_id <value>')
    .option('-f, --format <value>')
    .action(
        async (options) => {
            const status = await axios.get(`http://localhost:9103/intelliq_api/getsessionanswers/${options.questionnaire_id}/${options.session_id}`).catch((error)=>{
                console.log(error);
                return;
            });
            if(options.format === undefined || options.format === 'json') {
                console.log(status.data);
            }
            else if(options.format === 'csv') {
                const csvTransformed = sessionAnswersJsonToCsv(status.data)
                console.log(csvTransformed)
            }
            else {
                console.log('invalid format requested: ',options.format)
            }
        }
    )

program.command('getquestionanswers')
    .requiredOption('-p, --questionnaire_id <value>')
    .requiredOption('-p, --question_id <value>')
    .option('-f, --format <value>')
    .action(
        async (options) => {
            const status = await axios.get(`http://localhost:9103/intelliq_api/getquestionanswers/${options.questionnaire_id}/${options.question_id}`).catch((error)=>{
                console.log(error);
                return;
            });
            if(options.format === undefined || options.format === 'json') {
                console.log(status.data);
            }
            else if(options.format === 'csv') {
                const csvTransformed = questionAnswersJsonToCsv(status.data)
                console.log(csvTransformed)
            }
            else {
                console.log('invalid format requested: ',options.format)
            }
        }
    )


program.command('showsessionanswers')
    .requiredOption('-p, --session_id <value>')
    .option('-f, --format <value>')
    .action(
        async (options) => {
            const status = await axios.get(`http://localhost:9103/intelliq_api/showsessionanswers/${options.session_id}`).catch((error)=>{
                console.log(error);
                return;
            });
            if(options.format === undefined || options.format === 'json') {
                console.log(status.data);
            }
            else if(options.format === 'csv') {
                const csvTransformed = showsessionanswersJsonToCsv(status.data)
                console.log(csvTransformed)
            }
            else {
                console.log('invalid format requested: ',options.format)
            }
        }
    )


program.command('questionstats')
    .requiredOption('-p, --questionnaire_id <value>')
    .requiredOption('-p, --question_id <value>')
    .option('-f, --format <value>')
    .action(
        async (options) => {
            const status = await axios.get(`http://localhost:9103/intelliq_api/questionstats/${options.questionnaire_id}/${options.question_id}`).catch((error)=>{
                console.log(error);
                return;
            });
            if(options.format === undefined || options.format === 'json') {
                console.log(status.data);
            }
            else if(options.format === 'csv') {
                const csvTransformed = questionstatsJsonToCsv(status.data)
                console.log(csvTransformed)
            }
            else {
                console.log('invalid format requested: ',options.format)
            }
        }
    )


function questionAnswersJsonToCsv(jsonData) {
    const fields = ['questionnaireID', 'qID', 'session_id', 'optID'];
    const jsonRows = [];
    for (const answer of jsonData.answers) {
        jsonRows.push({
            questionnaireID: jsonData.questionnaireID,
            qID: jsonData.qID,
            session_id: answer.session_id,
            optID: answer.optID,
        });
    }
    const csvData = json2csv.parse(jsonRows, { fields });
    return csvData;
}


function sessionAnswersJsonToCsv(jsonData) {
    const fields = ['questionnaireID', 'session', 'qID', 'ans'];
    const jsonRows = [];
    for (const answer of jsonData.answers) {
        jsonRows.push({
            questionnaireID: jsonData.questionnaireID,
            session: jsonData.session,
            qID: answer.qID,
            ans: answer.ans,
        });
    }
    const csvData = json2csv.parse(jsonRows, { fields });
    return csvData;
}

function questionnaireJsonToCsv(json) {
    let csv = '';

    // add the headers
    const headers = Object.keys(json.questions[0]);
    csv += headers.join(',') + '\n';

    // add the data rows
    json.questions.forEach(row => {
        const values = headers.map(header => {
            if (Array.isArray(row[header])) {
                return `"${row[header].join('|')}"`;
            } else {
                return `"${row[header]}"`;
            }
        });
        csv += values.join(',') + '\n';
    });

    return csv;
}

function showsessionanswersJsonToCsv(jsonData) {
    const fields = ['question', 'answer'];
    const jsonRows = [];
    for (const answer of jsonData) {
        jsonRows.push({
            question: answer.question,
            answer: answer.answer,
        });
    }
    const csvData = json2csv.parse(jsonRows, { fields });
    return csvData;
}

function questionstatsJsonToCsv(jsonData) {
    const fields = ['option', 'percentage'];
    const jsonRows = [];
    for (const answer of jsonData) {
        jsonRows.push({
            option: answer.option,
            percentage: answer.percentage,
        });
    }
    const csvData = json2csv.parse(jsonRows, { fields });
    return csvData;
}
function questionJsonToCsv(json) {
    // Extract the relevant data from the JSON object
    const { questionnaireID, qID, qtext, required, type, options } = json;

    // Create an array to hold the CSV rows
    const csvRows = [];

    // Add the header row
    csvRows.push(['questionnaireID', 'qID', 'qtext', 'required', 'type', 'optID', 'opttxt', 'nextqID']);

    // Add a row for each option
    for (const option of options) {
        csvRows.push([questionnaireID, qID, qtext, required, type, option.optID, option.opttxt, option.nextqID]);
    }

    // Convert the array of rows to a CSV string
    const csvString = csvRows.map(row => row.join(',')).join('\n');

    return csvString;
}
program.parse(process.argv);