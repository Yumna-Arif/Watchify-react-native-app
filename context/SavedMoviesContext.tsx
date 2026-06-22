import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchSavedMoviesFromFirebase,
  saveMovieToFirebase,
  removeMovieFromFirebase,
} from "@/services/firebase";

interface SavedMoviesContextType {
  savedMovies: SavedMovie[];
  addSavedMovie: (movie: SavedMovie) => Promise<void>;
  removeSavedMovie: (movieId: number) => Promise<void>;
  isSaved: (movieId: number) => boolean;
  loading: boolean;
}

const SavedMoviesContext = createContext<SavedMoviesContextType | undefined>(
  undefined
);

export const SavedMoviesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSavedMovies = async () => {
      try {
        console.log("[SavedMovies] Loading from Firebase...");
        const firebaseMovies = await fetchSavedMoviesFromFirebase();
        console.log("[SavedMovies] Firebase load success. Movies:", firebaseMovies);
        setSavedMovies(firebaseMovies);
        await AsyncStorage.setItem("savedMovies", JSON.stringify(firebaseMovies));
      } catch (error) {
        console.warn(
          "[SavedMovies] Firebase load failed, falling back to AsyncStorage:",
          error
        );

        try {
          const stored = await AsyncStorage.getItem("savedMovies");
          if (stored) {
            const parsedMovies = JSON.parse(stored);
            console.log(
              "[SavedMovies] Loaded from AsyncStorage (offline cache):",
              parsedMovies
            );
            setSavedMovies(parsedMovies);
          } else {
            console.log("[SavedMovies] No offline cache found");
          }
        } catch (storageError) {
          console.error("[SavedMovies] AsyncStorage error:", storageError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSavedMovies();
  }, []);

  const addSavedMovie = async (movie: SavedMovie) => {
    try {
      console.log("[SavedMovies] Adding movie with ID:", movie.id, "Title:", movie.title);
      console.log("[SavedMovies] Full movie object:", JSON.stringify(movie));
      const updated = [...savedMovies.filter((m) => m.id !== movie.id), movie];
      setSavedMovies(updated);

      try {
        await saveMovieToFirebase(movie);
        console.log("[SavedMovies] Movie saved to Firebase successfully");
      } catch (firebaseError) {
        console.warn("[SavedMovies] Failed to save to Firebase, syncing on next load", firebaseError);
      }

      await AsyncStorage.setItem("savedMovies", JSON.stringify(updated));
      console.log("[SavedMovies] Movie saved to AsyncStorage cache");
    } catch (error) {
      console.error("[SavedMovies] Error adding saved movie:", error);
    }
  };

  const removeSavedMovie = async (movieId: number) => {
    try {
      console.log("[SavedMovies] Removing movie:", movieId);
      const updated = savedMovies.filter((m) => m.id !== movieId);
      setSavedMovies(updated);

      try {
        await removeMovieFromFirebase(movieId);
        console.log("[SavedMovies] Movie removed from Firebase successfully");
      } catch (firebaseError) {
        console.warn("[SavedMovies] Failed to remove from Firebase, syncing on next load", firebaseError);
      }

      await AsyncStorage.setItem("savedMovies", JSON.stringify(updated));
      console.log("[SavedMovies] Movie removed from AsyncStorage cache");
    } catch (error) {
      console.error("[SavedMovies] Error removing saved movie:", error);
    }
  };

  const isSaved = (movieId: number) => savedMovies.some((m) => m.id === movieId);

  return (
    <SavedMoviesContext.Provider
      value={{
        savedMovies,
        addSavedMovie,
        removeSavedMovie,
        isSaved,
        loading,
      }}
    >
      {children}
    </SavedMoviesContext.Provider>
  );
};

export const useSavedMovies = () => {
  const context = useContext(SavedMoviesContext);
  if (!context) {
    throw new Error("useSavedMovies must be used within SavedMoviesProvider");
  }
  return context;
};
