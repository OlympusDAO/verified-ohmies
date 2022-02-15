import { dark } from "./dark";
import { light } from "./light";
// TODO: Add system theme choice.
// import system from './system';

const themes = {
  dark,
  light,
  // system
};

export default function getTheme(theme) {
  return themes[theme];
}