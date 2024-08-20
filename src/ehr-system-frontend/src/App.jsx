import React, { useState, useEffect } from 'react';
import './index.scss';
import { ehr_system_backend } from '../../declarations/ehr-system-backend';

function App() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [newPatient, setNewPatient] = useState({ name: '', dob: '' });
  const [updatePatientData, setUpdatePatientData] = useState({ id: '', name: '', dob: '' });
  const [newRecord, setNewRecord] = useState({ content: '' });
  const [editRecordData, setEditRecordData] = useState({ id: '', content: '' });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const allPatients = await ehr_system_backend.getAllPatients();
    setPatients(allPatients);
  };

  const createPatient = async (e) => {
    e.preventDefault();
    const patientId = await ehr_system_backend.createPatient(newPatient.name, newPatient.dob);
    setNewPatient({ name: '', dob: '' });
    setSuccessMessage('Patient created successfully');
    fetchPatients();
  };

  const updatePatient = async (e) => {
    e.preventDefault();
    const success = await ehr_system_backend.updatePatient(updatePatientData.id, updatePatientData.name, updatePatientData.dob);
    if (success) {
      setSuccessMessage('Patient updated successfully');
      fetchPatients();
    } else {
      setSuccessMessage('Failed to update patient');
    }
  };

  const selectPatient = async (patientId) => {
    const patient = await ehr_system_backend.getPatient(patientId);
    setSelectedPatient(patient);
    const patientRecords = await ehr_system_backend.getRecords(patientId);
    setRecords(patientRecords);
    setUpdatePatientData({ id: patientId, name: patient.name, dob: patient.dob });
  };

  const addRecord = async (e) => {
    e.preventDefault();
    if (selectedPatient) {
      await ehr_system_backend.addRecord(selectedPatient.id, newRecord.content);
      setNewRecord({ content: '' });
      setSuccessMessage('Record added successfully');
      selectPatient(selectedPatient.id);
    }
  };

  const deleteRecord = async (recordId) => {
    const result = await ehr_system_backend.deleteRecord(recordId);
    if (result) {
      setSuccessMessage('Record deleted successfully');
      if (selectedPatient) {
        selectPatient(selectedPatient.id);
      }
    } else {
      setSuccessMessage('Failed to delete record');
    }
  };

  const editRecord = async (e) => {
    e.preventDefault();
    const success = await ehr_system_backend.editRecord(editRecordData.id, editRecordData.content);
    if (success) {
      setSuccessMessage('Record updated successfully');
      if (selectedPatient) {
        selectPatient(selectedPatient.id);
      }
    } else {
      setSuccessMessage('Failed to update record');
    }
  };

  return (
    <div className="App">
      <h1>Welcome to the NHS Unified EHR System</h1>

      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="patient-list">
        <h2>Patients</h2>
        <ul>
          {patients.map(patient => (
            <li key={patient.id} onClick={() => selectPatient(patient.id)}>
              {patient.name} (DoB: {patient.dob})
            </li>
          ))}
        </ul>
      </div>

      <div className="create-patient">
        <h2>Create New Patient</h2>
        <form onSubmit={createPatient}>
          <input 
            type="text" 
            placeholder="Name" 
            value={newPatient.name} 
            onChange={e => setNewPatient({...newPatient, name: e.target.value})} 
          />
          <input 
            type="date" 
            value={newPatient.dob} 
            onChange={e => setNewPatient({...newPatient, dob: e.target.value})} 
          />
          <button type="submit">Create Patient</button>
        </form>
      </div>

      {selectedPatient && (
        <div className="patient-records">
          <h2>Records for {selectedPatient.name}</h2>
          <ul>
            {records.map(record => (
              <li key={record.id}>
                {record.content} (Timestamp: {record.timestamp})
                <button onClick={() => deleteRecord(record.id)}>Delete</button>
                <button onClick={() => setEditRecordData({ id: record.id, content: record.content })}>Edit</button>
              </li>
            ))}
          </ul>
          <form onSubmit={addRecord}>
            <textarea 
              placeholder="New record content" 
              value={newRecord.content} 
              onChange={e => setNewRecord({...newRecord, content: e.target.value})} 
            />
            <button type="submit">Add Record</button>
          </form>
          {editRecordData.id && (
            <form onSubmit={editRecord}>
              <textarea 
                placeholder="Edit record content" 
                value={editRecordData.content} 
                onChange={e => setEditRecordData({...editRecordData, content: e.target.value})} 
              />
              <button type="submit">Update Record</button>
            </form>
          )}
          <div className="update-patient">
            <h2>Update Patient Information</h2>
            <form onSubmit={updatePatient}>
              <input 
                type="text" 
                placeholder="Name" 
                value={updatePatientData.name} 
                onChange={e => setUpdatePatientData({...updatePatientData, name: e.target.value})} 
              />
              <input 
                type="date" 
                value={updatePatientData.dob} 
                onChange={e => setUpdatePatientData({...updatePatientData, dob: e.target.value})} 
              />
              <button type="submit">Update Patient</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;