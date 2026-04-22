import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PageLayout } from "./components/layout/PageLayout.js";
import Home from "./pages/Home.js";
import { Problems } from "./pages/Problems.js";
import { NewProblem } from "./pages/NewProblem.js";
import { ProblemDetail } from "./pages/ProblemDetail.js";
import { CheckinForm } from "./pages/CheckinForm.js";
import { Review } from "./pages/Review.js";
import { Stats } from "./pages/Stats.js";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PageLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/new" element={<NewProblem />} />
          <Route path="/problems/:id/edit" element={<NewProblem />} />
          <Route path="/problems/:id" element={<ProblemDetail />} />
          <Route path="/problems/:id/checkin" element={<CheckinForm />} />
          <Route path="/review" element={<Review />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  );
}
