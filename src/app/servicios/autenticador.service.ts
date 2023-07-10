import { Injectable } from '@angular/core';
import { Firestore, updateDoc, addDoc, collection, query, where, getDocs, QuerySnapshot, DocumentReference } from '@angular/fire/firestore';
import { Especialista } from '../clases/especialista';
import { Paciente } from '../clases/paciente';
import { User, UserCredential, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, getAuth, sendEmailVerification, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificacionesService } from './notificaciones.service';
import { Administrador } from '../clases/administrador';
@Injectable({
  providedIn: 'root'
})

export class AutenticadorService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$: Observable<any> = this.currentUserSubject.asObservable();
  usuarioAutenticado: { uid: any; email: any; nombre: any; } | undefined | User;
  constructor(private firebase: Firestore, private notificacionS: NotificacionesService) { }
  public tokenSubject = new BehaviorSubject<string>('');
  get token$(): Observable<string> {
    return this.tokenSubject.asObservable();
  }
  public auth = getAuth();
  private colUsuarios = collection(this.firebase, 'usuarios');
  async cerrarSeccion(): Promise<void> {
    const auth = getAuth();
    await signOut(auth);
    this.tokenSubject.next('');
  }
  async altaEspecialista(especialista: Especialista, email: string, password: string) {
    this.colUsuarios = collection(this.firebase, 'usuarios');
    let colEspecialidades = collection(this.firebase, 'especialidades');
    await this.createUser(especialista, email, password);
    const docRef = await addDoc(this.colUsuarios, []);
      await updateDoc(docRef, {especialidad:especialista.especialidad,especialista:especialista.email});
      if(especialista.especialidad2!="")
      {
        await updateDoc(docRef, {especialidad:especialista.especialidad2,especialista:especialista.email});
      }
  }
  async altaHorario(especialista: string, especialidad: string, horarioNuevo: any, duracion:string) {
    try {
      const colHorarios = collection(this.firebase, 'disponibilidad');
  
      const horario = {
        especialista: especialista,
        especialidad: especialidad,
        horario: horarioNuevo,
        duracion: duracion
        // Add other fields as needed
      };
      console.log(horario);
  
      const docRef = await this.checkHorarioExist(especialista, especialidad);
      if (docRef) {
        await updateDoc(docRef, horario);
        console.log('Document updated');
      } else {
        await addDoc(colHorarios, horario);
        console.log('Document added');
      }
    } catch (error) {
      console.error('Error adding/updating document:', error);
      throw error;
    }
  }
  
  async checkHorarioExist(especialista: string, especialidad: string): Promise<DocumentReference | null> {
    const horariosRefCol = collection(this.firebase, 'horarios');
    const q = query(horariosRefCol, where('especialista', '==', especialista), where('especialidad', '==', especialidad));
    const querySnapshot: QuerySnapshot<any> = await getDocs(q);
  
    if (querySnapshot.size === 1) {
      const docRef = querySnapshot.docs[0].ref;
      return docRef;
    }
    return null;
  }
  
  async altaAdministrador(administrador: Administrador, email: string, password: string) {
    this.colUsuarios = collection(this.firebase, 'usuarios');
    await this.createUser(administrador, email, password);
  }
  async altaPaciente(usuario: Paciente, email: string, password: string) {
    this.colUsuarios = collection(this.firebase, 'usuarios');
    await this.createUser(usuario, email, password);
  }
  async getUserByUID(uid: string): Promise<any> {
    const usuariosRefCollection = collection(this.firebase, 'usuarios');
    const q = query(usuariosRefCollection, where('_id', '==', uid));

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      const user = {
        uid: docSnapshot.data()['_id'],
        email: docSnapshot.data()['email'],
        nombre: docSnapshot.data()['nombre']
        // Add other fields as needed
      };
      this.usuarioAutenticado = user;
      this.currentUserSubject.next(user);
      // console.log(user);
      return user;
    }
    return null;
  }
 
  async getUserCurrentUser(): Promise<any> {
    const uid = this.getToken();
    if (uid) {
      const usuario = await this.getUserByUID(uid);
      return usuario;
    }
    return null;
  }
  public getToken(): string | null {
    if (localStorage.getItem('token') != "") {
      return localStorage.getItem('token');
    }
    return this.tokenSubject.value;
  }
  async subirHistorialLogin(usuarioMail: string) {
    try {
      const loginRef = collection(this.firebase, 'historialLogins');
      const historial = {
        usuario: usuarioMail,
        fecha: new Date().toLocaleString('es-AR')
      };
      await addDoc(loginRef, historial);
    }
    catch (error) {
      console.log("Error subiendo historial.", error);
      throw error;
    }
    finally {
    }
  }

  checkEmailVerificationStatus() {
    const user = this.auth.currentUser;

    if (user != null) {

      if (user.emailVerified) {
        this.notificacionS.toastNotificationSuccess("Email verificado");
        console.log('Email is verified.');
        return true;
      } else {
        this.notificacionS.toastNotificationError("Email aun sin verificar");
        console.log('Email is not verified.');
        return false;
      }
    } else {
      return false;
      console.log('No user is currently signed in.');
    }
  }


  private async createUser(user: Especialista | Paciente | Administrador, email: string, password: string) {
    try {
      const auth = getAuth();
      const usuarioObj = user.toFirestoreObject();

      const usuarioNuevo = await createUserWithEmailAndPassword(auth, email, password);
      sendEmailVerification(usuarioNuevo.user);
      const newId = usuarioNuevo.user?.uid;
      if (!newId) {
        throw new Error("User ID not found after creating a new user");
      }
      user.setId(newId);
      const docRef = await addDoc(this.colUsuarios, usuarioObj);
      await updateDoc(docRef, user.toFirestoreObject());

    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }
  async autenticateSingIn(userCredential: UserCredential): Promise<any> {
    const token = userCredential.user?.uid || '';
    this.usuarioAutenticado = userCredential.user;
    localStorage.setItem('token', token); // save token to localStorage
    this.tokenSubject.next(token);
    return userCredential;
  }

  async checkIfUserExists(email: string): Promise<boolean> {
    try {
      const auth = getAuth();
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0;
    } catch (error) {
      console.error('Error verificando si el usuario existe:', error);
      return false;
    }
  }
}