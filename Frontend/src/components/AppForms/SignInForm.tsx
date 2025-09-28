/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../../hooks/useAuth";
import { FormInput } from "../Form/form-input";
import { useState } from "react";
import styled from "styled-components";

const StyledLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 1rem;
  color: #0d6efd;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

export type loginFormProps = {
  email: string;
  password: string;
};

const validateInputSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(7, "Invalid Password"),
});

type validationSchema = z.infer<typeof validateInputSchema>;

export const LoginForm = () => {
  const { login, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<validationSchema>({ resolver: zodResolver(validateInputSchema) });
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const onSubmit: SubmitHandler<validationSchema> = (data) => {
    try {
      login(data);
      if (isAuthenticated) {
        navigate("/");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setLocalError(message);
    }
  };

  return (
    <div>
      <div className="mb-3">
        {error ? (
          <Alert key="danger" variant="danger">
            {error}
          </Alert>
        ) : (
          ""
        )}
      </div>
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <FormInput<loginFormProps>
              type="email"
              id="email"
              name="email"
              placeholder="Enter email"
              register={register}
              errors={errors}
            />
            <FormInput<loginFormProps>
              type="password"
              id="password"
              name="password"
              placeholder="Enter password"
              register={register}
              errors={errors}
            />
            <Button className="w-100" variant="primary" type="submit">
              Submit
            </Button>
            <StyledLink to="/register">
              <small>Register</small>
            </StyledLink>
          </Form>
          <div>
            {localError && <p style={{ color: "red" }}>{localError}</p>}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};
