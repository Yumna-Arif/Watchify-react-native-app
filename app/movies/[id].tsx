import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import useFetch from "@/services/useFetch";
import { fetchMovieDetails } from "@/services/api";
import { icons } from "@/constants/icons";
import { useSavedMovies } from "@/context/SavedMoviesContext";

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-300 text-sm font-normal">{label}</Text>
    <Text className="text-light-100 text-sm font-bold mt-2">
      {value || "N/A"}
    </Text>
  </View>
);

const MovieDetails = () => {
  const { id } = useLocalSearchParams();
  const { addSavedMovie, removeSavedMovie, isSaved } = useSavedMovies();
  const [savedState, setSavedState] = useState(false);

  const { data: movie, isLoading } = useFetch(() =>
    fetchMovieDetails(id as string)
  );

  // Update savedState when movie loads
  useEffect(() => {
    if (movie?.id) {
      setSavedState(isSaved(movie.id));
    }
  }, [movie?.id, isSaved]);

  const handleSavePress = async () => {
    if (!movie) return;

    console.log("[MovieDetails] Save button pressed. Movie ID:", movie.id, "Title:", movie.title);
    
    if (savedState) {
      await removeSavedMovie(movie.id);
      setSavedState(false);
    } else {
      const movieToSave = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
      };
      console.log("[MovieDetails] Saving movie:", JSON.stringify(movieToSave));
      await addSavedMovie(movieToSave);
      setSavedState(true);
    }
  };

  return (
    <View className="flex-1 bg-primary">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,
            }}
            className="w-100 h-[550px]"
            resizeMode="stretch"
          ></Image>
        </View>
        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">{movie?.title}</Text>
          <View className="flex-row item-center gap-x-1 mt-2">
            <Text className="text-light-100 text-sm">
              {movie?.release_date?.split("-")[0]}
            </Text>
            <Text className="text-light-100 text-sm">{movie?.runtime}min</Text>
          </View>
          <View className="flex-row item-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
            <Image source={icons.star} className="size-4"></Image>
            <Text className="text-white text-sm font-bold">
              {Math.round(movie?.vote_average ?? 0)}/10
            </Text>
            <Text className="text-light-300 text-sm">
              ({movie?.vote_count} votes)
            </Text>
          </View>
          <MovieInfo label="Overview" value={movie?.overview}></MovieInfo>
          <MovieInfo
            label="Genres"
            value={movie?.genres?.map((g) => g.name).join(" - ") || "N/A"}
          ></MovieInfo>
          <View className="flex flex-row justify-between w-1/2">
            <MovieInfo
              label="Budget"
              value={`$${(movie?.budget ?? 0) / 1_000_000} Million`}
            ></MovieInfo>
            <MovieInfo
              label="Revenue"
              value={`$${Math.round((movie?.revenue ?? 0) / 1_000_000)} Millon`}
            ></MovieInfo>
          </View>
          <MovieInfo
            label="Production Companies"
            value={
              movie?.production_companies.map((c) => c.name).join(" - ") ||
              "N/A"
            }
          ></MovieInfo>
        </View>
      </ScrollView>
      <View className="absolute bottom-5 left-0 right-0 mx-5 flex flex-row gap-3 z-50">
        <TouchableOpacity
          className="flex-1 bg-dark-100 rounded-lg py-3.5 flex flex-row items-center justify-center border border-accent"
          onPress={router.back}
        >
          <Image
            source={icons.arrow}
            className="size-5 mr-1 mt-0.5 rotate-180"
            tintColor={"#ff9c01"}
          ></Image>
          <Text className="text-accent font-semibold text-base">Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 rounded-lg py-3.5 flex flex-row items-center justify-center ${
            savedState ? "bg-accent" : "bg-dark-100 border border-accent"
          }`}
          onPress={handleSavePress}
        >
          <Image
            source={icons.save}
            className="size-5 mr-1"
            tintColor={savedState ? "#151312" : "#ff9c01"}
          ></Image>
          <Text
            className={`font-semibold text-base ${
              savedState ? "text-secondary" : "text-accent"
            }`}
          >
            {savedState ? "Saved" : "Save"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MovieDetails;
