import { router } from "expo-router";
import ScreenScroll from "../../../components/ScreenScroll";
import { useAppDataContext } from "../../../providers/AppDataProvider";
import ShoppingTab from "../../../screens/ShoppingTab";

export default function Shopping() {
  const { data, setData } = useAppDataContext();

  return (
    <ScreenScroll>
      <ShoppingTab
        data={data}
        setData={setData}
        onGoWeek={() => router.navigate("/week")}
      />
    </ScreenScroll>
  );
}
