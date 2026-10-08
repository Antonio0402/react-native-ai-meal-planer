import { router } from "expo-router";
import ScreenScroll from "../../../components/ScreenScroll";
import { useAppDataContext } from "../../../providers/AppDataProvider";
import WeekTab from "../../../screens/WeekTab";

export default function Week() {
  const { data, setData } = useAppDataContext();

  return (
    <ScreenScroll>
      <WeekTab
        data={data}
        setData={setData}
        onSaved={() => router.navigate("/shopping")}
      />
    </ScreenScroll>
  );
}
