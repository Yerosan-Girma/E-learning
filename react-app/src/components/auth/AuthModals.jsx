import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

function ModalShell({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
            </div>
            <div className="modal-body">{children}</div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  );
}

export default function AuthModals() {
  const {
    activeModal,
    closeModal,
    login,
    signup,
    openSignupModal,
    openLoginModal,
  } = useAuth();

  const [loginForm, setLoginForm] = useState({ email: "", password: "", rememberMe: false });
  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [activeModal]);

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    login(loginForm);
  };

  const handleSignupSubmit = (event) => {
    event.preventDefault();
    signup(signupForm);
  };

  return (
    <>
      <ModalShell open={activeModal === "login"} title="Login to Your Account" onClose={closeModal}>
        <form onSubmit={handleLoginSubmit}>
          <div className="mb-3">
            <label htmlFor="loginEmail" className="form-label">
              Email address
            </label>
            <input
              id="loginEmail"
              type="email"
              className="form-control"
              required
              value={loginForm.email}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="loginPassword" className="form-label">
              Password
            </label>
            <input
              id="loginPassword"
              type="password"
              className="form-control"
              required
              value={loginForm.password}
              onChange={(event) =>
                setLoginForm((prev) => ({ ...prev, password: event.target.value }))
              }
            />
          </div>

          <div className="mb-3 form-check">
            <input
              id="rememberMe"
              className="form-check-input"
              type="checkbox"
              checked={loginForm.rememberMe}
              onChange={(event) =>
                setLoginForm((prev) => ({ ...prev, rememberMe: event.target.checked }))
              }
            />
            <label className="form-check-label" htmlFor="rememberMe">
              Remember me
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>

        <div className="text-center mt-3">
          <a href="#" className="text-decoration-none" onClick={(event) => event.preventDefault()}>
            Forgot password?
          </a>
          <p className="mt-2 mb-0">
            Do not have an account?{" "}
            <button
              type="button"
              className="btn btn-link p-0 align-baseline"
              onClick={openSignupModal}
            >
              Sign up
            </button>
          </p>
        </div>
      </ModalShell>

      <ModalShell open={activeModal === "signup"} title="Create Your Free Account" onClose={closeModal}>
        <form onSubmit={handleSignupSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                className="form-control"
                required
                value={signupForm.firstName}
                onChange={(event) =>
                  setSignupForm((prev) => ({ ...prev, firstName: event.target.value }))
                }
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                className="form-control"
                required
                value={signupForm.lastName}
                onChange={(event) =>
                  setSignupForm((prev) => ({ ...prev, lastName: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="signupEmail" className="form-label">
              Email address
            </label>
            <input
              id="signupEmail"
              type="email"
              className="form-control"
              required
              value={signupForm.email}
              onChange={(event) =>
                setSignupForm((prev) => ({ ...prev, email: event.target.value }))
              }
            />
          </div>

          <div className="mb-3">
            <label htmlFor="signupPassword" className="form-label">
              Password
            </label>
            <input
              id="signupPassword"
              type="password"
              className="form-control"
              required
              value={signupForm.password}
              onChange={(event) =>
                setSignupForm((prev) => ({ ...prev, password: event.target.value }))
              }
            />
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="form-control"
              required
              value={signupForm.confirmPassword}
              onChange={(event) =>
                setSignupForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
              }
            />
          </div>

          <div className="mb-3 form-check">
            <input
              id="termsAgree"
              className="form-check-input"
              type="checkbox"
              checked={signupForm.agreeTerms}
              onChange={(event) =>
                setSignupForm((prev) => ({ ...prev, agreeTerms: event.target.checked }))
              }
            />
            <label className="form-check-label" htmlFor="termsAgree">
              I agree to Terms and Conditions
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Create Account
          </button>
        </form>

        <div className="text-center mt-3">
          <p className="mb-0">
            Already have an account?{" "}
            <button type="button" className="btn btn-link p-0 align-baseline" onClick={openLoginModal}>
              Login
            </button>
          </p>
        </div>
      </ModalShell>
    </>
  );
}
