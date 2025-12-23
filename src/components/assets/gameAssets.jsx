import React from "react";
import nicklePng from "./nickle.png";
import pennyPng from "./penny.png";
import dimePng from "./dime.png";
import quarterPng from "./quarter.png";
import oneD from "./oneDollar.jpg";
import fiveD from "./fiveDollar.png";
import tenD from "./tenDollar.png";
import twentyD from "./twentyDollar.jpg";
import fiftyD from "./fiftyDollar1.png";
import hundoD from "./hundoDollar.png";

export const UnicornAvatar = ({ image, className = "" }) => {
  if (!image) return null;

  return (
    <img
      src={image}
      alt="Unicorn"
      className={`object-contain drop-shadow-xl ${className}`}
    />
  );
};

export const COIN_ASSETS = {
  penny: pennyPng,
  nickel: nicklePng,
  dime: dimePng,
  quarter: quarterPng,
};

export const BILL_ASSETS = {
  1: oneD,
  5: fiveD,
  10: tenD,
  20: twentyD,
  50: fiftyD,
  100: hundoD,
};

const COIN_SIZES = {
  quarter: "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36",
  nickel: "w-40 h-40 sm:w-24 sm:h-44 md:w-48 md:h-48 lg:w-42 lg:h-42",
  penny: "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28",
  dime: "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24",
};

export const Coin = ({ type, onClick, disabled }) => {
  const sizeClasses = COIN_SIZES[type] || COIN_SIZES.penny;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        transition-transform 
        ${
          disabled
            ? "opacity-50"
            : "hover:scale-110 active:scale-95 cursor-pointer"
        }
        flex items-center justify-center p-2
      `}
    >
      <img
        src={COIN_ASSETS[type]}
        alt={type}
        className={`${sizeClasses} drop-shadow-xl object-contain`}
      />
    </button>
  );
};

export const Bill = ({ value, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        transition-transform w-full
        ${
          disabled
            ? "opacity-50"
            : "hover:scale-105 active:scale-95 cursor-pointer"
        }
        flex justify-center
      `}
    >
      <img
        src={BILL_ASSETS[value]}
        alt={`$${value}`}
        className="w-full max-w-sm md:max-w-md aspect-[2.61/1] object-cover drop-shadow-xl rounded-md"
      />
    </button>
  );
};

export const BracketLeftSVG = () => (
  <svg
    viewBox="0 0 30 120"
    width="25"
    height="120"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
    strokeLinecap="round"
  >
    <path d="M25 5 L5 5 L5 115 L25 115" />
  </svg>
);
export const BracketRightSVG = () => (
  <svg
    viewBox="0 0 30 120"
    width="25"
    height="120"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
    strokeLinecap="round"
  >
    <path d="M5 5 L25 5 L25 115 L5 115" />
  </svg>
);
