import { Timestamp } from "firebase/firestore";

export class Paciente {
    _id:string;
    nombre: string;
    apellido: string;
    edad: number;
    dni:string;
    obraSocial:string;
    email: string;
    foto1: string;
    foto2: string;

    constructor(dni:string, email: string, nombre: string, apellido: string, edad: number, obraSocial: string, foto1: string, foto2:string) {
        this._id ="";
        this.dni = dni;
        this.email = email;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.obraSocial = obraSocial;
        this.foto1 = foto1;
        this.foto2 = foto2;
    }
    toFirestoreObject() {
        return {
            _id:this._id,
            dni: this.dni,
            email: this.email,
            nombre: this.nombre,
            apellido: this.apellido,
            edad: this.edad,
            obraSocial: this.obraSocial,
            foto1: this.foto1,
            foto2: this.foto2,
            tipo: "paciente"
        };
    }
    
    getId() {
        return this.dni;
    }
    setId(value:string) {
        this._id = value;
    }

    
}
