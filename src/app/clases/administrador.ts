import { Timestamp } from "firebase/firestore";

export class Administrador {
    _id:string;
    nombre: string;
    apellido: string;
    edad: number;
    dni:string;
    email: string;
    foto1: string;

    constructor(dni:string, email: string, nombre: string, apellido: string, edad: number, foto1: string) {
        this._id ="";
        this.dni = dni;
        this.email = email;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
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
            foto1: this.foto1,
            tipo: "administrador"
        };
    }
    
    getId() {
        return this.dni;
    }
    setId(value:string) {
        this._id = value;
    }

    
}
