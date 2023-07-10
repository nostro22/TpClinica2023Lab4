import { Timestamp } from "firebase/firestore";

export class Especialista {
    _id:string;
    nombre: string;
    apellido: string;
    edad: number;
    dni:string;
    especialidad:string;
    especialidad2:string;
    email: string;
    foto1: string;

    constructor(dni:string, email: string, nombre: string, apellido: string, edad: number, especialidad: string, especialidad2: string, foto1: string) {
        this._id ="";
        this.dni = dni;
        this.email = email;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.especialidad = especialidad;
        this.especialidad2 = especialidad2;
        this.foto1 = foto1;
    }
    toFirestoreObject() {
        return {
            _id:this._id,
            dni: this.dni,
            email: this.email,
            nombre: this.nombre,
            apellido: this.apellido,
            edad: this.edad,
            especialidad: this.especialidad,
            especialidad2: this.especialidad2,
            foto1: this.foto1,
            tipo: "especialista"
        };
    }
    
    getId() {
        return this.dni;
    }
    setId(value:string) {
        this._id = value;
    }

    
}
