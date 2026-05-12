import React from "react";
import GameCard from "./GameCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const GameSlider = ({ title, games, sliderId }) => {
  return (
    <section className="game-section">
      {/* ── Section header with title + nav arrows ── */}
      <div className="game-section-header">
        <h2 className="game-section-title">{title}</h2>

        <div className="game-section-nav">
          <button
            type="button"
            className={`game-section-nav-btn ${sliderId}-prev`}
            aria-label="Previous games"
          >
            <i className="bx bx-chevron-left" />
          </button>
          <button
            type="button"
            className={`game-section-nav-btn ${sliderId}-next`}
            aria-label="Next games"
          >
            <i className="bx bx-chevron-right" />
          </button>
        </div>
      </div>

      {/* ── Swiper carousel ── */}
      <Swiper
        className="game-section-swiper"
        modules={[Navigation]}
        spaceBetween={12}
        slidesPerView={5}
        slidesPerGroup={5}
        navigation={{
          prevEl: `.${sliderId}-prev`,
          nextEl: `.${sliderId}-next`,
        }}
        breakpoints={{
          320: { slidesPerView: 1, slidesPerGroup: 1 },
          640: { slidesPerView: 2, slidesPerGroup: 2 },
          1024: { slidesPerView: 3, slidesPerGroup: 3 },
          1280: { slidesPerView: 5, slidesPerGroup: 5 },
        }}
      >
        {games.map((game) => (
          <SwiperSlide key={game.id}>
            <GameCard
              id={game.id}
              title={game.title}
              type={game.type}
              price={game.price}
              image={game.image}
              isUpcoming={game.isUpcoming}
              releaseLabel={game.releaseLabel}
              originalPrice={game.originalPrice}
              detailPath={game.detailPath}
              detailState={game}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default GameSlider;
