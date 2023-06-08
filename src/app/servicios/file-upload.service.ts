import { v4 as uuidv4 } from 'uuid';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, addDoc, collection, deleteDoc, getDocs, orderBy, query, where } from '@angular/fire/firestore';
import { getDownloadURL, ref, uploadBytesResumable, Storage } from '@angular/fire/storage';
@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  constructor(private storage: Storage, private firestore: Firestore) { }

  async uploadFiles(input: HTMLInputElement, fileCategory: string, usuario:string) {
    if (!input.files) return;
    const fotosPerfilRefCollection = collection(this.firestore, 'fotosPerfil');
    const files: FileList = input.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) {
        const fileId = uuidv4();
        const filePath = 'fotos/' + fileId + file.name;
        const fileRef = ref(this.storage, filePath);
        const taskStorage = uploadBytesResumable(fileRef, file);
        const snapshot = await taskStorage;
        const downloadURL = await getDownloadURL(snapshot.ref);

        const photoRefDoc = {
          usuario: usuario,
          downloadURL: downloadURL,
          fecha: new Date().toLocaleString('es-AR'),
          tipo: fileCategory
        };
        await addDoc(fotosPerfilRefCollection, photoRefDoc);
      }
    }
  }

  async getDownloadURLFromCollectionPerfil(usuario: string): Promise<string | null> {
    const fotosPerfilRefCollection = collection(this.firestore, 'fotosPerfil');

    try {
      const q = query(fotosPerfilRefCollection, where('usuario', '==', usuario), where('tipo','==','fotoPerfil'));
      const querySnapshot: QuerySnapshot<any> = await getDocs(q);

      if (querySnapshot.size === 1) {
        const docData = querySnapshot.docs[0].data();
        return docData.downloadURL || null;
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    }

    return null;
  }
  async getDownloadURLFromCollectionPerfil2(usuario: string): Promise<string | null> {
    const fotosPerfilRefCollection = collection(this.firestore, 'fotosPerfil');

    try {
      const q = query(fotosPerfilRefCollection, where('usuario', '==', usuario), where('tipo','==','fotoPerfil2'));
      const querySnapshot: QuerySnapshot<any> = await getDocs(q);

      if (querySnapshot.size === 1) {
        const docData = querySnapshot.docs[0].data();
        return docData.downloadURL || null;
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    }

    return null;
  }
  async  getListEspecialidades(): Promise<string[]> {
    const especialistasCollectionRef = collection(this.firestore, 'usuarios');
  
    try {
      const querySnapshot: QuerySnapshot<any> = await getDocs(especialistasCollectionRef);
      const especialidadesSet = new Set<string>();
  
      querySnapshot.forEach((doc) => {
        const especialidad = doc.data().especialidad;
        console.log(especialidad);
        if(especialidad!=" " && especialidad!=undefined)
        {
          especialidadesSet.add(especialidad);
        }
      });
  
      const especialidadesList = Array.from(especialidadesSet);
      return especialidadesList;
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }
  async esEspecialita(email: string): Promise<boolean> {
    const especialistasCollectionRef = collection(this.firestore, 'usuarios');
    try {
      const q = query(especialistasCollectionRef, where('email', '==', email),where('tipo','==','especialista'));
      const querySnapshot: QuerySnapshot<any> = await getDocs(q);
  
      if (querySnapshot.size === 1) {
        return true;
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  
    return false;
  }
  async esEspecialitaAprobado(email: string): Promise<boolean> {
    const especialistasCollectionRef = collection(this.firestore, 'especialistaAprobado');
    try {
      const q = query(especialistasCollectionRef, where('email', '==', email));
      const querySnapshot: QuerySnapshot<any> = await getDocs(q);
      if (querySnapshot.size === 1) {
        return true;
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    }
    return false;
  }
  async desabilitarEspecialista(email: string): Promise<boolean> {
    const especialistasCollectionRef = collection(this.firestore, 'especialistaAprobado');
    try {
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(
        query(especialistasCollectionRef, where('email', '==', email))
      );
  
      if (querySnapshot.size === 1) {
        querySnapshot.forEach((doc) => {
          deleteDoc(doc.ref);
        });
        return true;
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
    return false;
  }
  async habilitarEspecialista(email: string): Promise<boolean> {
    const especialistasCollectionRef = collection(this.firestore, 'especialistaAprobado');
    try {
      await addDoc(especialistasCollectionRef, { email });
      return true;
    } catch (error) {
      console.error('Error adding document:', error);
      return false;
    }
  }
  async habilitarAdministrador(email: string): Promise<boolean> {
    const especialistasCollectionRef = collection(this.firestore, 'administradores');
    try {
      await addDoc(especialistasCollectionRef, { email });
      return true;
    } catch (error) {
      console.error('Error adding document:', error);
      return false;
    }
  }
  
  async esPaciente(email: string): Promise<boolean> {
    const especialistasCollectionRef = collection(this.firestore, 'usuarios');
    try {
      const q = query(especialistasCollectionRef, where('email', '==', email),where('tipo','==','paciente'));
      const querySnapshot: QuerySnapshot<any> = await getDocs(q);
  
      if (querySnapshot.size === 1) {
        return true;
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    }
    return false;
  }
  async esAdmin(email: string): Promise<boolean> {
    const especialistasCollectionRef = collection(this.firestore, 'administradores');
    if(email!=null)
    {

      try {
        const q = query(especialistasCollectionRef, where('email', '==', email));
        const querySnapshot: QuerySnapshot<any> = await getDocs(q);
        
        if (querySnapshot.size === 1) {
          return true;
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    }
  
    return false;
  }

  async getUsuarios(): Promise<any> {
    const usuariosRefCollection = collection(this.firestore, 'usuarios');
    const q = query(
      usuariosRefCollection,
      orderBy('tipo', 'desc'),
      orderBy('nombre', 'desc'),
    );
  
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const usuarios = querySnapshot.docs.map(docSnapshot => docSnapshot.data());
      return usuarios;
    }
    // If no records are found, you can return a default value or throw an exception, depending on your needs.
    return [];
  }
  
}