import React from 'react'
import GameCard from './GameCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const GameSlider = ({ title, games, sliderId }) => {
    return (
        <div>
            <section className="discover-content">
                <div className="discover-header">
                    <h3 className="discover-title">{title}</h3>

                    <div className="discover-nav">
                        <button
                            type="button"
                            className={`discover-nav-btn ${sliderId}-prev`}
                            aria-label="Previous games"
                        >
                            <i className="bx bx-chevron-left" />
                        </button>

                        <button
                            type="button"
                            className={`discover-nav-btn ${sliderId}-next`}
                            aria-label="Next games"
                        >
                            <i className="bx bx-chevron-right" />
                        </button>
                    </div>
                </div>

                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={10}
                    slidesPerView={5}
                    slidesPerGroup={5}
                    navigation={{
                        prevEl: `.${sliderId}-prev`,
                        nextEl: `.${sliderId}-next`,
                    }}
                    pagination={{ enabled: false }}
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
                                title={game.title}
                                type={game.type}
                                price={game.price}
                                image={game.image}
                                isUpcoming={game.isUpcoming}
                                releaseLabel={game.releaseLabel}
                                discountPercent={game.discountPercent}
                                originalPrice={game.originalPrice}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>
        </div>
    )
}

export default GameSlider
