DROP SCHEMA IF EXISTS que_database;
CREATE SCHEMA que_database;
USE que_database;



CREATE TABLE Questionnaire(
    questionnaire_id VARCHAR(10) PRIMARY KEY,
    title VARCHAR(30) NOT NULL
    
);

CREATE TABLE Q_Session (
	session_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    opened_date DATE NOT NULL,
    submitted VARCHAR(255) NOT NULL,
    questionnaire_id VARCHAR(10) NOT NULL,
    
	FOREIGN KEY (questionnaire_id) REFERENCES Questionnaire (questionnaire_id)
);

CREATE TABLE Question (
    question_id VARCHAR(10) PRIMARY KEY,
    question_text VARCHAR(255) NOT NULL,
    required VARCHAR(255) NOT NULL,
    q_type VARCHAR(255) NOT NULL,
    questionnaire_id VARCHAR(10) NOT NULL,
    
    FOREIGN KEY (questionnaire_id) REFERENCES Questionnaire (questionnaire_id)	
);

CREATE TABLE Q_Option (
    option_id VARCHAR(10) PRIMARY KEY,
    option_text VARCHAR(255) NOT NULL,
    question_id VARCHAR(10) NOT NULL,
    next_q_id VARCHAR(10) NOT NULL,
    
    FOREIGN KEY (question_id) REFERENCES Question(question_id)	ON DELETE CASCADE,
    FOREIGN KEY (next_q_id) REFERENCES Question(question_id)
);


CREATE TABLE Answer(
	answer_id VARCHAR(10) PRIMARY KEY,
    session_id INTEGER NOT NULL,
    question_id VARCHAR(10) NOT NULL,
    option_id VARCHAR(10) NOT NULL,
    
    FOREIGN KEY (session_id) REFERENCES Q_Session (session_id)	ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES Question(question_id)	ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES Q_option(option_id)	ON DELETE CASCADE
    
);