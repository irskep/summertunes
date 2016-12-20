import createBus from "./createBus";
import localStorageJSON from "../util/localStorageJSON";


const [setIsInfoVisible, bIsInfoVisible] = createBus()
const kIsInfoVisible = bIsInfoVisible
  .skipDuplicates()
  .toProperty(() => localStorageJSON("uiIsInfoVisible", false));

/* localStorage sync */

kIsInfoVisible.onValue((isInfoVisible) => localStorage.uiIsInfoVisible = JSON.stringify(isInfoVisible))

export {
  kIsInfoVisible,
  setIsInfoVisible,
}