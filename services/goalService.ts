import { db } from "@/firebase";
import { Goal } from "@/types/Goal";
import { auth } from "@/firebase";
import { addDoc, collection, getDocs } from "firebase/firestore";

export const goalRef = collection(db,"goal")

export const createGoal = async (goal:Goal) => {
    try {
        const userId = auth.currentUser?.uid;
        if (userId) {
            const docRef = await addDoc(goalRef, { ...goal, userId });
            console.log("Document written with ID: ", docRef.id);
            return docRef;
        } else {
            console.error("User not authenticated");
            throw new Error("User not authenticated");
        }
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
}

export const getAllGoals = async () => {
    try {
        const querySnapshot = await getDocs(goalRef);
        console.log("Query Snapshot: ", querySnapshot);
        return querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id
            
        })) as Goal[];
    } catch (e) {
        console.error("Error getting documents: ", e);
        return [];
    }
}