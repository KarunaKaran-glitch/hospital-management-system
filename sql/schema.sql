create table if not exists patient (
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

create table if not exists doctor (
    doctor_id varchar(4) primary key check(doctor_id like 'd%' and LENGTH(doctor_id) = 4),
    doctor_name varchar(255) not null,
    doctor_specialization varchar(255) not n    ull,
    doctor_date_of_birth date not null,
    doctor_contact varchar(10) check(LENGTH(doctor_contact) = 10) not null,
    doctor_address varchar(255) not null,
    doctor_is_available boolean not null
);

create table if not exists report (
    report_id varchar(11) primary key check(report_id like 'R%' and LENGTH(report_id) = 11),
    patient_id varchar(6) references patient(patient_id) not null,
    doctor_id varchar(4) references doctor(doctor_id) not null,
    date_of_visit timestamp not null,
    doctor_remarks text
);

create table if not exists visit (
    patient_id varchar(6) references patient(patient_id) not null,
    doctor_id varchar(4) references doctor(doctor_id) not null,
    date_of_visit timestamp not null,
    visit_status varchar(20) check(visit_status in ('pending','visited','missed','cancelled')) not null,
    report_id varchar(11) references report(report_id),
    visit_reason varchar(255),
    primary key(patient_id,doctor_id,date_of_visit)
);

-- Mock data for patient table
INSERT INTO patient (patient_id, patient_name, patient_dob, patient_address, patient_contact, patient_gender, patient_blood_group, patient_height, patient_weight, patient_updated_at) VALUES
('p00001', 'John Doe', '1985-06-14', '123 Main St, Anytown', '1234567890', 'M', 'O+', 175.0, 70.5, NOW()),
('p00002', 'Jane Smith', '1990-02-20', '456 Oak Ave, Anytown', '2345678901', 'F', 'A-', 162.5, 55.2, NOW()),
('p00003', 'Alice Johnson', '1978-11-30', '789 Pine Rd, Anytown', '3456789012', 'F', 'B+', 168.0, 65.0, NOW()),
('p00004', 'Robert Brown', '2000-07-10', '101 Maple Dr, Anytown', '4567890123', 'M', 'AB-', 180.3, 80.1, NOW()),
('p00005', 'Emily Davis', '1995-03-25', '202 Birch Ln, Anytown', '5678901234', 'F', 'O-', 155.0, 50.8, NOW()),
('p00006', 'Michael Wilson', '1982-09-05', '303 Cedar Ct, Anytown', '6789012345', 'M', 'A+', 178.0, 75.3, NOW()),
('p00007', 'Jessica Garcia', '1998-12-12', '404 Elm St, Anytown', '7890123456', 'F', 'B-', 170.0, 60.0, NOW()),
('p00008', 'David Rodriguez', '1970-01-01', '505 Spruce Ave, Anytown', '8901234567', 'M', 'AB+', 172.0, 85.5, NOW()),
('p00009', 'Linda Martinez', '2005-08-18', '606 Willow Way, Anytown', '9012345678', 'F', 'O+', 160.0, 48.2, NOW()),
('p00010', 'Christopher Lee', '1988-04-03', '707 Redwood Pl, Anytown', '0123456789', 'M', 'A+', 182.0, 77.9, NOW()),
('p00011', 'Sarah Connor', '1965-05-04', '808 Terminus Rd, LA', '1000000000', 'F', 'O-', 165.0, 60.0, NOW()),
('p00012', 'Kyle Reese', '1980-03-15', '909 Future St, LA', '1000000001', 'M', 'A+', 180.0, 75.0, NOW());

-- Mock data for doctor table
INSERT INTO doctor (doctor_id, doctor_name, doctor_specalist, doctor_date_of_birth, doctor_contact, doctor_address, doctor_is_available) VALUES
('d001', 'Dr. Alan Turing', 'Cardiology', '1912-06-23', '1122334455', '1 Hospital Rd, Medcity', true),
('d002', 'Dr. Ada Lovelace', 'Pediatrics', '1815-12-10', '2233445566', '2 Clinic Ave, Medcity', false),
('d003', 'Dr. Charles Babbage', 'Neurology', '1791-12-26', '3344556677', '3 Health St, Medcity', true),
('d004', 'Dr. Grace Hopper', 'Oncology', '1906-12-09', '4455667788', '4 Wellness Blvd, Medcity', true),
('d005', 'Dr. Tim Berners-Lee', 'Orthopedics', '1955-06-08', '5566778899', '5 Cure Ln, Medcity', false),
('d006', 'Dr. Margaret Hamilton', 'Dermatology', '1936-08-17', '6677889900', '6 Remedy Way, Medcity', true),
('d007', 'Dr. John von Neumann', 'General Medicine', '1903-12-28', '7788990011', '7 Care Ct, Medcity', true),
('d008', 'Dr. Hedy Lamarr', 'ENT', '1914-11-09', '8899001122', '8 Healing Dr, Medcity', false),
('d009', 'Dr. Donald Knuth', 'Pulmonology', '1938-01-10', '9900112233', '9 Life Pl, Medcity', true),
('d010', 'Dr. Radia Perlman', 'Gastroenterology', '1951-01-01', '0011223344', '10 Vitality Sq, Medcity', true);

-- Mock data for report table
-- Ensure patient_id and doctor_id exist from above tables
INSERT INTO report (report_id, patient_id, doctor_id, date_of_visit, doctor_remarks) VALUES
('R0000000001', 'p00001', 'd001', '2023-10-01 10:00:00', 'Patient shows signs of improvement. Follow up in 2 weeks.'),
('R0000000002', 'p00002', 'd002', '2023-10-01 11:00:00', 'Routine checkup. Child is healthy.'),
('R0000000003', 'p00003', 'd003', '2023-10-02 09:30:00', 'MRI scheduled for next week. Prescribed medication for headaches.'),
('R0000000004', 'p00004', 'd004', '2023-10-02 14:00:00', 'Discussed treatment options. Patient is considering chemotherapy.'),
('R0000000005', 'p00005', 'd005', '2023-10-03 16:00:00', 'X-ray shows minor fracture. Cast applied.'),
('R0000000006', 'p00006', 'd006', '2023-10-03 08:45:00', 'Skin rash identified. Topical cream prescribed.'),
('R0000000007', 'p00007', 'd007', '2023-10-04 13:15:00', 'General flu symptoms. Advised rest and hydration.'),
('R0000000008', 'p00008', 'd008', '2023-10-04 10:30:00', 'Hearing test conducted. Results normal.'),
('R0000000009', 'p00009', 'd009', '2023-10-05 11:20:00', 'Breathing difficulties. Inhaler prescribed.'),
('R0000000010', 'p00010', 'd010', '2023-10-05 15:00:00', 'Stomach pain. Endoscopy recommended if symptoms persist.');

-- Mock data for visit table
-- Ensure patient_id, doctor_id, date_of_visit, and report_id correspond to the report table entries
INSERT INTO visit (patient_id, doctor_id, date_of_visit, visit_status, report_id) VALUES
('p00001', 'd001', '2023-10-01 10:00:00', 'visited', 'R0000000001'),
('p00002', 'd002', '2023-10-01 11:00:00', 'visited', 'R0000000002'),
('p00003', 'd003', '2023-10-02 09:30:00', 'visited', 'R0000000003'),
('p00004', 'd004', '2023-10-02 14:00:00', 'visited', 'R0000000004'),
('p00005', 'd005', '2023-10-03 16:00:00', 'visited', 'R0000000005'),
('p00006', 'd006', '2023-10-03 08:45:00', 'visited', 'R0000000006'),
('p00007', 'd007', '2023-10-04 13:15:00', 'visited', 'R0000000007'),
('p00008', 'd008', '2023-10-04 10:30:00', 'missed', 'R0000000008'),
('p00009', 'd009', '2023-10-05 11:20:00', 'pending', 'R0000000009'),
('p00010', 'd010', '2023-10-05 15:00:00', 'cancelled', 'R0000000010');
