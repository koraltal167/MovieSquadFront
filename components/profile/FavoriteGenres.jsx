import React from "react";

export default function FavoriteGenres({ genres }) {
  return (
    <div className="flex flex-wrap">
      {genres.map(genre => (
        <span key={genre} className="badge">{genre}</span>
      ))}
    </div>
  );
}
