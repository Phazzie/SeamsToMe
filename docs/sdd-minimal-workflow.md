# SDD Minimal Workflow: Getting Started with Seam-Driven Development

This document outlines the simplest possible workflow for beginners to start applying Seam-Driven Development effectively, especially those using AI as their primary implementation engine. This minimal approach focuses on the highest-value activities that give immediate benefits.

## The Core SDD Loop: 5 Essential Steps

For beginners, Seam-Driven Development can be simplified to this essential workflow:

### 1. Define the Contract (Seam)

**Goal**: Create a clear, detailed interface between two components.

**Minimal Activities**:

- Identify two components that need to communicate
- Define the data structures they will exchange
- Specify the methods/functions one will call on the other
- Document error handling expectations

**Example**:

```typescript
// UserService.contract.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserServiceContract {
  // Get a user by ID
  getUser(id: string): Promise<User | null>;

  // Create a new user
  createUser(user: Omit<User, "id">): Promise<User>;

  // Error handling expectations:
  // - Invalid ID format: throw InvalidIdError
  // - User not found: return null
  // - Email already exists: throw DuplicateEmailError
}
```

**Tips for AI-Assisted Development**:

- Be extremely specific about data types and structures
- Include detailed comments about error scenarios
- Keep contracts focused on one specific interaction

### 2. Create Minimal Stubs

**Goal**: Create skeletal implementations that fulfill the contract's signature but contain minimal logic.

**Minimal Activities**:

- Implement each component with empty or placeholder methods
- Include detailed blueprint comments explaining purpose and flow
- Return mock data or simple responses

**Example**:

```typescript
// UserService.stub.ts
import { User, UserServiceContract } from "./UserService.contract";

/**
 * User Service Implementation
 *
 * PURPOSE: Manages user data including creation and retrieval
 * DATA FLOW: API Layer → UserService → Database
 * KEY INTERACTIONS: Validates user data, handles unique email constraints
 */
export class UserService implements UserServiceContract {
  async getUser(id: string): Promise<User | null> {
    // TODO: Implement database lookup
    // Will query the user table using the provided ID
    // If found, returns user object, otherwise null
    return {
      id: "mock-id",
      name: "Mock User",
      email: "mock@example.com",
    };
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    // TODO: Implement user creation
    // Steps:
    // 1. Validate email format
    // 2. Check for existing email
    // 3. Generate unique ID
    // 4. Insert into database
    // 5. Return created user with ID
    return {
      id: "generated-id",
      ...user,
    };
  }
}
```

**Tips for AI-Assisted Development**:

- Write extensive comments about implementation intentions
- Keep actual code minimal - just enough to satisfy the contract
- Focus on clear structure rather than functionality

### 3. Write Basic Tests for the Seam

**Goal**: Create tests that verify the contract is correctly implemented by both sides.

**Minimal Activities**:

- Test the happy path (normal successful operation)
- Test basic error conditions
- Focus on the seam interaction, not internal logic

**Example**:

```typescript
// UserService.test.ts
import { UserService } from "./UserService";

describe("UserService Contract Conformance", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  test("getUser returns a user with correct shape", async () => {
    const user = await userService.getUser("any-id");

    // If user is null, this is still a valid response per contract
    if (user) {
      // Verify the returned user has all required fields
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("email");
    }
  });

  test("createUser returns a user with an id", async () => {
    const newUser = {
      name: "Test User",
      email: "test@example.com",
    };

    const createdUser = await userService.createUser(newUser);

    expect(createdUser).toHaveProperty("id");
    expect(createdUser.name).toBe(newUser.name);
    expect(createdUser.email).toBe(newUser.email);
  });
});
```

**Tips for AI-Assisted Development**:

- Focus on testing the contract, not implementation details
- Keep tests simple but thorough for the contract's requirements
- Document test assumptions in comments

### 4. Implement Glue Code

**Goal**: Connect the components through their seam with minimal integration logic.

**Minimal Activities**:

- Create code that passes data from one component to another
- Handle basic data transformation if needed
- Add logging at the seam boundary

**Example**:

```typescript
// ApiUserController.ts
import { UserService } from "./UserService";

export class ApiUserController {
  constructor(private userService: UserService) {}

  async handleGetUser(req: any, res: any) {
    try {
      const userId = req.params.id;
      console.log(`Requesting user with ID: ${userId}`);

      const user = await this.userService.getUser(userId);

      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async handleCreateUser(req: any, res: any) {
    try {
      const userData = req.body;
      console.log("Creating user with data:", userData);

      const newUser = await this.userService.createUser({
        name: userData.name,
        email: userData.email,
      });

      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
```

**Tips for AI-Assisted Development**:

- Keep glue code focused on correctly passing data across the seam
- Add logging to make the data flow visible
- Handle errors appropriately according to the contract

### 5. Implement Internal Logic

**Goal**: Fill in the actual implementation of components once the seams are working correctly.

**Minimal Activities**:

- Replace stub code with real implementation
- Maintain conformance with the contract
- Add internal validation and business logic

**Example**:

```typescript
// UserService.ts with real implementation
import { User, UserServiceContract } from "./UserService.contract";
import { Database } from "./Database";
import { v4 as uuidv4 } from "uuid";

export class UserService implements UserServiceContract {
  constructor(private db: Database) {}

  async getUser(id: string): Promise<User | null> {
    if (!this.isValidUuid(id)) {
      throw new InvalidIdError("Invalid user ID format");
    }

    return this.db
      .query("SELECT * FROM users WHERE id = ?", [id])
      .then((rows) => rows[0] || null);
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    // Validate email format
    if (!this.isValidEmail(user.email)) {
      throw new Error("Invalid email format");
    }

    // Check for duplicate email
    const existing = await this.db.query(
      "SELECT id FROM users WHERE email = ?",
      [user.email]
    );

    if (existing.length > 0) {
      throw new DuplicateEmailError("Email already in use");
    }

    // Create new user with generated ID
    const newUser = {
      id: uuidv4(),
      ...user,
    };

    await this.db.query(
      "INSERT INTO users (id, name, email) VALUES (?, ?, ?)",
      [newUser.id, newUser.name, newUser.email]
    );

    return newUser;
  }

  private isValidUuid(id: string): boolean {
    // Simple validation for demo purposes
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id
    );
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// Custom error classes
export class InvalidIdError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidIdError";
  }
}

export class DuplicateEmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateEmailError";
  }
}
```

**Tips for AI-Assisted Development**:

- Ask AI to implement against the contract definition
- Provide the AI with the stub including all blueprint comments
- Verify implementation against contract tests
- Implement one component at a time

## Prompting AI Effectively in the SDD Workflow

For each step of the minimal SDD workflow, here are effective prompt templates to get the best results from AI:

### Contract Definition Prompts

```
"I need to define a contract for interaction between [ComponentA] and [ComponentB].
The [ComponentA] will need to [action] from [ComponentB].
The data exchanged should include [data details].
Error scenarios include [list potential errors].

Please create a TypeScript interface that defines this contract. Include detailed
comments about expected behavior, error handling, and any constraints."
```

### Stub Creation Prompts

```
"Based on this contract: [paste contract code]

Please create a minimal stub implementation that satisfies this contract.
Include extensive blueprint comments explaining:
- The purpose of each method
- The expected data flow
- Implementation intentions and logic steps
- Error handling approach

The actual implementation should be minimal, just enough to make it compile
and pass simple tests."
```

### Contract Test Prompts

```
"Given this contract and stub implementation:
[paste contract and stub code]

Write contract conformance tests that verify:
1. All methods return the expected data structures
2. Basic error conditions are handled as specified in the contract
3. The API shape matches the contract exactly

Focus only on testing the contract conformance, not internal implementation details."
```

### Glue Code Prompts

```
"I need to connect these two components through their defined seam:
[paste both component contracts/stubs]

Write glue code that:
1. Passes data from [ComponentA] to [ComponentB]
2. Handles any necessary data transformation
3. Manages errors according to the contract
4. Includes logging at the seam boundary

The focus should be on correct integration, not internal component logic."
```

### Implementation Prompts

```
"I have a stub implementation that needs to be completed with real functionality:
[paste contract and stub with blueprint comments]

Please implement the full functionality according to the contract and blueprint comments.
Ensure it handles all error cases specified in the contract.
The implementation should maintain the same interface but replace placeholder logic
with actual business logic."
```

## Common Pitfalls for Beginners

1. **Over-complicated Contracts**: Start with simpler contracts and gradually add complexity.
2. **Insufficient Comments**: For AI-assisted development, more comments are better than fewer.
3. **Skipping Tests**: Even simple tests are critical for validating contract conformance.
4. **Monolithic Components**: Keep components focused on a single responsibility.
5. **Implementing Too Early**: Resist the urge to implement functionality before seams are stable.

---

This document presents a simplified SDD workflow designed specifically for beginners and AI-assisted development. As you become more comfortable with these basics, you can incorporate more advanced SDD practices from the full documentation.
