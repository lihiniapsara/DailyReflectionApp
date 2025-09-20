import { db } from "@/firebase";
import { Goal } from "@/types/Goal";
import { auth } from "@/firebase";
import { addDoc, collection } from "firebase/firestore";

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