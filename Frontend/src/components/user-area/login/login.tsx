import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { CredentialsModel } from "../../../models/credentials-model";
import { userService } from "../../../services/user-service";
import { notify } from "../../../utils/notify";
import "./login.css";

export function Login() {

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CredentialsModel>();
    const navigate = useNavigate();

    async function send(credentials: CredentialsModel): Promise<void> {
        try {
            await userService.login(credentials);
            notify.success(`Welcome back, ${credentials.username}!`);
            navigate("/todays-logs");
        }
        catch (err: any) {
            notify.error(err);
        }
    }

    return (
        <div className="Login">

            <form className="card" onSubmit={handleSubmit(send)} noValidate>

                <h2>Log in</h2>
                <p className="subtitle">Track what you eat, one meal at a time.</p>

                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    autoFocus
                    aria-invalid={!!errors.username}
                    {...register("username", {
                        required: "Username is required.",
                        validate: value => value.trim().length > 0 || "Username is required."
                    })}
                />
                {errors.username && <span className="field-error">{errors.username.message}</span>}

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    {...register("password", { required: "Password is required." })}
                />
                {errors.password && <span className="field-error">{errors.password.message}</span>}

                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Log in"}
                </button>

            </form>

        </div>
    );
}
