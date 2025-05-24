create table patient (
    patient_id varchar(6) primary key check(patient_id like 'p%' and LENGTH(patient_id) = 6),
    patient_name varchar(255) not null,
    patient_dob date not null,
    patient_address varchar(255) not null,
    patient_contact varchar(10) check(LENGTH(patient_contact) = 10) not null,
    patient_gender varchar(1) check(patient_gender in ('M', 'F')) not null,
    patient_blood_group varchar(3) check(patient_blood_group in ('O+','O-','A+','A-','B+','B-','AB+','AB-')) not null,
    patient_height decimal,
    patient_weight decimal,
    patient_updated_at timestamp not null
);

create table doctor (
    doctor_id varchar(4) primary key check(doctor_id like 'd%' and LENGTH(doctor_id) = 4),
    doctor_name varchar(255) not null,
    doctor_specalist varchar(255) not null,
    doctor_contact varchar(10) check(LENGTH(doctor_contact) = 10) not null,
    doctor_address varchar(255) not null,
    doctor_is_available boolean not null
);

create table report (
    report_id varchar(11) primary key check(report_id like 'R%' and LENGTH(report_id) = 11),
    patient_id varchar(6) references patient(patient_id) not null,
    doctor_id varchar(4) references doctor(doctor_id) not null,
    date_of_visit timestamp not null,
    doctor_remarks text,
);

create table visit (
    patient_id varchar(6) references patient(patient_id) not null,
    doctor_id varchar(4) references doctor(doctor_id) not null,
    date_of_visit timestamp not null,
    visit_status varchar(20) check(visit_status in ('pending','visited','missed','cancelled')) not null,
    report_id varchar(11) references report(report_id) not null,
    primary key(patient_id,doctor_id,date_of_visit),
);
