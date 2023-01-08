use que_database;


SET AUTOCOMMIT=0;
INSERT INTO questionnaire VALUES
("QQ000","My first research questionnaire");

COMMIT;



SET AUTOCOMMIT=0;
INSERT INTO Question VALUES
("P00","Ποιά είναι η ηλικία σας;" , "TRUE", "profile","QQ000" ),
("Q01","Ποιό είναι το αγαπημένο σας χρώμα;", "TRUE", "question","QQ000"),
("Q02","Ασχολείστε με το ποδόσφαιρο;", "TRUE", "question","QQ000"),
("Q03","Τι ομάδα είστε;", "TRUE", "question","QQ000"),
("Q04","Έχετε ζήσει σε νησί;", "TRUE", "question","QQ000"),
("Q05","Με δεδομένο ότι απαντήσατε [*Q04A1] στην ερώτηση [*Q04]: Ποια η σχέση σας με το θαλάσσιο σκι;", "TRUE", "question","QQ000"),
("Q06","Είστε χειμερινός κολυμβητής", "TRUE", "question","QQ000");

COMMIT;



SET AUTOCOMMIT=0;
INSERT INTO q_option VALUES
("P01A1","<30","P00","Q01"),
("P01A2","30-50","P00","Q01"),
("P01A3","50-70","P00","Q01"),
("P01A4",">70","P00","Q01"),

("Q01A1","Πράσινο","Q01","Q02"),
("Q01A2","Κόκκινο","Q01","Q02"),
("Q01A3","Κίτρινο","Q01","Q02"),

("Q02A1","Ναι","Q02","Q03"),
("Q02A2","Όχι","Q02","Q04"),

("Q03A1","Παναθηναικός","Q03","Q04"),
("Q03A2","Ολυμπιακός","Q03","Q04"),
("Q03A3","ΑΕΚ","Q03","Q04"),

("Q04A1","Ναι","Q04","Q05"),
("Q04A2","Όχι","Q04","Q06");

COMMIT;


