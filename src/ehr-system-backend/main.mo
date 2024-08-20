import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Time "mo:base/Time";

actor EHRSystem {
    type Patient = {
        id: Text;
        name: Text;
        dob: Text;
    };

    type Record = {
        id: Text;
        patientId: Text;
        content: Text;
        timestamp: Int;
    };

    private stable var nextRecordId: Nat = 0;
    private var patientMap = HashMap.HashMap<Text, Patient>(0, Text.equal, Text.hash);
    private var recordMap = HashMap.HashMap<Text, Record>(0, Text.equal, Text.hash);

    public func createPatient(name: Text, dob: Text) : async Text {
        let id = Text.concat(name, dob);
        let newPatient : Patient = { id; name; dob };
        patientMap.put(id, newPatient);
        id
    };

    public func addRecord(patientId: Text, content: Text) : async Text {
        let id = Nat.toText(nextRecordId);
        nextRecordId += 1;
        let newRecord : Record = { 
            id;
            patientId;
            content;
            timestamp = Time.now();
        };
        recordMap.put(id, newRecord);
        id
    };

    public func updatePatient(id: Text, name: Text, dob: Text) : async Bool {
        switch (patientMap.get(id)) {
            case (?patient) {
                let updatedPatient : Patient = { id; name; dob };
                patientMap.put(id, updatedPatient);
                true
            };
            case null { false };
        }
    };

    public func deleteRecord(recordId: Text) : async Bool {
        switch (recordMap.remove(recordId)) {
            case (?record) { true };
            case null { false };
        }
    };

    public func editRecord(recordId: Text, content: Text) : async Bool {
        switch (recordMap.get(recordId)) {
            case (?record) {
                let updatedRecord : Record = {
                    id = record.id;
                    patientId = record.patientId;
                    content;
                    timestamp = record.timestamp;
                };
                recordMap.put(recordId, updatedRecord);
                true
            };
            case null { false };
        }
    };

    public query func getPatient(patientId: Text) : async ?Patient {
        patientMap.get(patientId)
    };

    public query func getRecords(patientId: Text) : async [Record] {
        Iter.toArray(Iter.filter(recordMap.vals(), func (r: Record) : Bool { r.patientId == patientId }))
    };

    public query func getAllPatients() : async [Patient] {
        Iter.toArray(patientMap.vals())
    };
}
