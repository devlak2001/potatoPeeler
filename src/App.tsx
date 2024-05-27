import { useEffect, useState } from "react";
// import type { Schema } from "../amplify/data/resource";
// import { generateClient } from "aws-amplify/data";
import Game from "./components/Game";
import { Loading } from "./components/Loading";
import {
  Authenticator,
  View,
  useTheme,
  Text,
  Heading,
  Button,
  useAuthenticator,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { generateClient } from "aws-amplify/data";
import { Schema } from "../amplify/data/resource.ts";

// const client = generateClient<Schema>();

const components = {
  SignUp: {
    Footer() {
      const { toSignIn } = useAuthenticator();

      return (
        <View textAlign="center">
          <Button
            fontWeight="normal"
            onClick={toSignIn}
            size="small"
            variation="link"
          >
            Back to Sign In
          </Button>
        </View>
      );
    },
  },
  ConfirmSignUp: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          Enter Information:
        </Heading>
      );
    },
    Footer() {
      return <Text>Footer Information</Text>;
    },
  },
  SetupTotp: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          Enter Information:
        </Heading>
      );
    },
    Footer() {
      return <Text>Footer Information</Text>;
    },
  },
  ConfirmSignIn: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          Enter Information:
        </Heading>
      );
    },
    Footer() {
      return <Text>Footer Information</Text>;
    },
  },
  ForgotPassword: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          Enter Information:
        </Heading>
      );
    },
    Footer() {
      return <Text>Footer Information</Text>;
    },
  },
  ConfirmResetPassword: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          Enter Information:
        </Heading>
      );
    },
    Footer() {
      return <Text>Footer Information</Text>;
    },
  },
};

const formFields = {
  signIn: {
    username: {
      placeholder: "Enter your email",
    },
  },
  signUp: {
    password: {
      label: "Password:",
      placeholder: "Enter your Password:",
      isRequired: false,
    },
    confirm_password: {
      label: "Confirm Password:",
    },
    preferred_username: {
      label: "Username",
      placeholder: "Enter your Username:",
      order: 1,
    },
  },
  forceNewPassword: {
    password: {
      placeholder: "Enter your Password:",
    },
  },
  forgotPassword: {
    username: {
      placeholder: "Enter your email:",
    },
  },
  confirmResetPassword: {
    confirmation_code: {
      placeholder: "Enter your Confirmation Code:",
      label: "New Label",
      isRequired: false,
    },
    confirm_password: {
      placeholder: "Enter your Password Please:",
    },
  },
  setupTotp: {
    QR: {
      totpIssuer: "test issuer",
      totpUsername: "amplify_qr_test_user",
    },
    confirmation_code: {
      label: "New Label",
      placeholder: "Enter your Confirmation Code:",
      isRequired: false,
    },
  },
  confirmSignIn: {
    confirmation_code: {
      label: "New Label",
      placeholder: "Enter your Confirmation Code:",
      isRequired: false,
    },
  },
};
const client = generateClient<Schema>();

function App() {
  const [scores, setScores] = useState<Schema["Score"]["type"][]>([]);

  const fetchScores = async () => {
    const { data: items } = await client.models.Score.list();
    console.log(items);
    setScores(items);
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const [showGame, setShowGame] = useState(false);

  return (
    // <main>
    //   <h1>My todos</h1>
    //   <button onClick={createTodo}>+ new</button>
    //   <ul>
    //     {todos.map((todo) => (
    //       <li key={todo.id}>{todo.content}</li>
    //     ))}
    //   </ul>
    //   <div>
    //     🥳 App successfully hosted. Try creating a new todo.
    //     <br />
    //     <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
    //       Review next step of this tutorial.
    //     </a>
    //   </div>
    // </main>
    <>
      <Authenticator
        formFields={formFields}
        components={components}
        signUpAttributes={["preferred_username"]}
      >
        {({ signOut }) => (
          <>
            <Loading setShowGame={setShowGame} />
            {showGame && <Game signOut={signOut} scores={scores} />}
          </>
        )}
      </Authenticator>
    </>
  );
}

export default App;
