import { fetchCoupons } from "@/lib/coupon";
import { getSession } from "@/lib/session";
import AuthHeader from "./components/AuthHeader";
import CouponList from "./components/CouponList";

const Home = async () => {
  const session = await getSession();

  const coupons = session
    ? session.userId !== process.env.ADMIN_USER_ID
      ? await fetchCoupons(session.userId)
      : await fetchCoupons()
    : [];

  return (
    <>
      <AuthHeader />
      <CouponList initialCoupons={coupons} />
    </>
  );
};

export default Home;
