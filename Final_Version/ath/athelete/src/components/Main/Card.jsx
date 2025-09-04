import React from "react";

const Card = ({ id, name, img, status }) => {
    return (
        <div>
            <div className="relative">
                <img
                    className="h-70 w-60 rounded-2xl hover:scale-105 duration-6=700 cursor-pointer shadow-lg"
                    src={img}
                    alt={name}
                ></img>
                <p className="absolute  bottom-4 left-4 font-medium text-white font-roboto no-underline leading-none">
                    {name}
                </p>
                <p className={`${status === "Offline" ? "absolute bottom-1 left-4 text-sm font-medium text-red-600 font-roboto no-underline leading-none"
                    : "absolute bottom-1 left-4 text-sm font-medium text-green-600 font-roboto no-underline leading-none"
                    }`}
                >{status}</p>
            </div>
        </div>
    );
};

export default Card;