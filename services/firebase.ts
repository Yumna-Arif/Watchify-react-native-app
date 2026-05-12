const getDatabaseUrl = () => {
  const databaseUrl = process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL;
  if (!databaseUrl || databaseUrl.includes("your-project-id")) {
    throw new Error(
      "Missing or invalid Firebase database URL. Set EXPO_PUBLIC_FIREBASE_DATABASE_URL in your .env with your actual Firebase Realtime Database URL."
    );
  }

  return databaseUrl.replace(/\/+$/, "");
};

const getApiKey = () => {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey || apiKey.includes("your_firebase_api_key")) {
    console.warn(
      "Firebase API key not configured. Database operations may fail. Set EXPO_PUBLIC_FIREBASE_API_KEY in your .env."
    );
    return "";
  }
  return apiKey;
};

const buildPath = (path: string) => {
  const baseUrl = `${getDatabaseUrl()}/${path}.json`;
  const apiKey = getApiKey();
  return apiKey ? `${baseUrl}?auth=${apiKey}` : baseUrl;
};

export const fetchSavedMoviesFromFirebase = async (): Promise<SavedMovie[]> => {
  try {
    const response = await fetch(buildPath("savedMovies"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Firebase fetch error (${response.status}):`,
        errorText
      );
      throw new Error(`Firebase API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Successfully fetched saved movies from Firebase:", data);
    
    if (!data) {
      return [];
    }

    return Object.values(data) as SavedMovie[];
  } catch (error) {
    console.error("Error fetching saved movies from Firebase:", error);
    throw error;
  }
};

export const saveMovieToFirebase = async (movie: SavedMovie) => {
  try {
    console.log(`Saving movie to Firebase: ${movie.id}`, movie);
    const response = await fetch(buildPath(`savedMovies/${movie.id}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movie),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Firebase save error (${response.status}):`,
        errorText
      );
      throw new Error(`Firebase API error: ${response.status}`);
    }

    const result = await response.json();
    console.log(`Successfully saved movie ${movie.id} to Firebase`);
    return result;
  } catch (error) {
    console.error(`Error saving movie ${movie.id} to Firebase:`, error);
    throw error;
  }
};

export const removeMovieFromFirebase = async (movieId: number) => {
  try {
    console.log(`Removing movie from Firebase: ${movieId}`);
    const response = await fetch(buildPath(`savedMovies/${movieId}`), {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Firebase delete error (${response.status}):`,
        errorText
      );
      throw new Error(`Firebase API error: ${response.status}`);
    }

    const result = await response.json();
    console.log(`Successfully removed movie ${movieId} from Firebase`);
    return result;
  } catch (error) {
    console.error(`Error removing movie ${movieId} from Firebase:`, error);
    throw error;
  }
};