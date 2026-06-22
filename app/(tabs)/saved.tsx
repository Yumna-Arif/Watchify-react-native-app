import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React from "react";
import { icons } from "@/constants/icons";
import { useSavedMovies } from "@/context/SavedMoviesContext";
import { router } from "expo-router";

const SavedMovieCard = ({ movie, onRemove }: any) => (
  <TouchableOpacity
    className="flex-row bg-dark-200 rounded-lg overflow-hidden mb-3 h-[140px] border border-dark-100"
    onPress={() => router.push(`/movies/${movie.id}`)}
  >
    <Image
      source={{
        uri: `https://image.tmdb.org/t/p/w200${movie.poster_path}`,
      }}
      className="w-24 h-full"
      resizeMode="cover"
    />
    <View className="flex-1 p-3 justify-between">
      <View>
        <Text className="text-white font-bold text-sm" numberOfLines={2}>
          {movie.title}
        </Text>
        <Text className="text-light-300 text-xs mt-1">
          {movie.release_date?.split("-")[0] || "N/A"}
        </Text>
      </View>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded gap-1">
          <Image source={icons.star} className="size-3"></Image>
          <Text className="text-white text-xs font-bold">
            {Math.round(movie.vote_average ?? 0)}/10
          </Text>
        </View>
        <TouchableOpacity onPress={() => onRemove(movie.id)}>
          <Image
            source={icons.save}
            className="size-5"
            tintColor="#ff6b6b"
          ></Image>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

const Saved = () => {
  const { savedMovies, removeSavedMovie, loading } = useSavedMovies();

  return (
    <View className="flex-1 bg-primary">
      <ScrollView className="flex-1 pt-16 px-5">
        <Text className="text-white font-bold text-2xl mb-5">My Saved Movies</Text>

        {loading ? (
          <View className="flex justify-center items-center flex-1 flex-col gap-5">
            <Text className="text-gray-500 text-base">Loading...</Text>
          </View>
        ) : savedMovies.length === 0 ? (
          <View className="flex justify-center items-center h-96 flex-col gap-5">
            <Image
              source={icons.save}
              className="size-10"
              tintColor={"#a8b5db"}
            ></Image>
            <Text className="text-gray-500 text-base">No saved movies yet</Text>
          </View>
        ) : (
          <View className="pb-32">
            {savedMovies.map((movie) => (
              <SavedMovieCard
                key={movie.id}
                movie={movie}
                onRemove={removeSavedMovie}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Saved;
