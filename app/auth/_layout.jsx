// app/auth/_layout.jsx
import { Stack } from "expo-router";
import { Fragment } from "react";
import { useSelector } from "react-redux";
import Loader from "../../components/Loader";

export default function AuthLayout() {
  const Student = useSelector((state) => state.Student);
  const studentLoading = Student.loading;

  const School = useSelector((state) => state.School);
  const schoolLoading = School.loading;

  const loading = studentLoading || schoolLoading;

  return (
    <Fragment>
      <Loader loading={loading} />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </Fragment>
  );
}
