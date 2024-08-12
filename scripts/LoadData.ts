import { type Doc } from "./generatemd"
import { log } from "console";
export function getData() {
  log("getData() is running")
  return docs;
}

const docs: Doc[] = [
  {
    Name: "LoginUser",
    Body: `
CREATE PROCEDURE [dbo].[LoginUser]
  @Email VARCHAR(100),
  @Hash CHAR(64)
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @UserId INT;
  DECLARE @CurrentDateTime DATETIME2 = GETUTCDATE();

  -- Check if the email and hash match an active user
  SELECT @UserId = u.Id
  FROM [dbo].[User] u
  INNER JOIN [dbo].[UserDetails] ud ON u.Id = ud.UserId
  WHERE u.Email = @Email AND u.Hash = @Hash AND u.Archived = 0;

  IF @UserId IS NOT NULL
  BEGIN
    -- Update the login success details
    UPDATE [dbo].[UserDetails]
    SET LastLoginDate = @CurrentDateTime,
        LastLoginAttempt = @CurrentDateTime,
        FailedLoginAttempts = 0
    WHERE UserId = @UserId;

    SELECT 
      u.Id,
      u.Email,
      ud.FirstName,
      ud.LastName,
      ud.PhoneNumber,
      ud.Country,
      ud.City,
      ud.Address
    FROM [dbo].[User] u
    INNER JOIN [dbo].[UserDetails] ud ON u.Id = ud.UserId
    WHERE u.Id = @UserId;
  END
  ELSE
  BEGIN
    -- Update the login failure details
    UPDATE [dbo].[UserDetails]
    SET LastLoginAttempt = @CurrentDateTime,
        FailedLoginAttempts = FailedLoginAttempts + 1
    WHERE EXISTS (SELECT 1 FROM [dbo].[User] WHERE Id = UserId AND Email = @Email);

    SELECT NULL AS UserId, 'Login failed' AS Message;
  END
END;
  `,
    Desc: "This procedure is used to authenticate a user by checking the email and hash against stored values. It updates the last login details on success and tracks failed login attempts.",
    Params: [
      "@Email VARCHAR(100)",
      "@Hash CHAR(64)"
    ],
    Returns: [
      "Id",
      "Email",
      "FirstName",
      "LastName",
      "PhoneNumber",
      "Country",
      "City",
      "Address"
    ],
    Refs: [
      "[dbo].[User]",
      "[dbo].[UserDetails]"
    ],
    Meta: "This procedure is crucial for maintaining the security and integrity of the user login process, ensuring that successful logins are recorded and failed attempts are tracked."
  },
  {
    Name: "GetUserByEmail",
    Body: "SELECT * FROM [User] WHERE Email = @Email;",
    Desc: "Retrieves a user's information based on their email address.",
    Params: ["@Email VARCHAR(255)"],
    Returns: ["UserID", "FirstName", "LastName", "Email", "LastLoginDate"],
    Refs: ["[User]"],
    Meta: "Version 1.0 - Created on 2024-08-12"
  },
  {
    Name: "AddNewUser",
    Body: "INSERT INTO [User] (UserID, FirstName, LastName, Email, CreatedDate) VALUES (@UserID, @FirstName, @LastName, @Email, GETDATE());",
    Desc: "Adds a new user to the User table.",
    Params: ["@UserID UNIQUEIDENTIFIER", "@FirstName VARCHAR(100)", "@LastName VARCHAR(100)", "@Email VARCHAR(255)"],
    Returns: ["AffectedRows"],
    Refs: ["[User]"],
    Meta: "Version 1.1 - Last updated on 2024-08-12"
  },
  {
    Name: "UpdateUserDetails",
    Body: "UPDATE [UserDetails] SET FirstName = @FirstName, LastName = @LastName WHERE UserID = @UserID;",
    Desc: "Updates a user's details in the UserDetails table.",
    Params: ["@UserID UNIQUEIDENTIFIER", "@FirstName VARCHAR(100)", "@LastName VARCHAR(100)"],
    Returns: ["AffectedRows"],
    Refs: ["[UserDetails]"],
    Meta: "Version 2.0 - Revised on 2024-08-12"
  },
  {
    Name: "DeleteUser",
    Body: "DELETE FROM [User] WHERE UserID = @UserID;",
    Desc: "Deletes a user from the User table based on their UserID.",
    Params: ["@UserID UNIQUEIDENTIFIER"],
    Returns: ["AffectedRows"],
    Refs: ["[User]"],
    Meta: "Version 1.0 - Created on 2024-08-12"
  },
  {
    Name: "GetAllUsers",
    Body: "SELECT * FROM [User];",
    Desc: "Retrieves all users from the User table.",
    Params: [],
    Returns: ["UserID", "FirstName", "LastName", "Email", "CreatedDate"],
    Refs: ["[User]"],
    Meta: "Version 1.0 - Created on 2024-08-12"
  },
  {
    Name: "AddUserRole",
    Body: "INSERT INTO [UserRoles] (UserID, RoleID) VALUES (@UserID, @RoleID);",
    Desc: "Associates a user with a role in the UserRoles table.",
    Params: ["@UserID UNIQUEIDENTIFIER", "@RoleID INT"],
    Returns: ["AffectedRows"],
    Refs: ["[UserRoles]"],
    Meta: "Version 1.0 - Created on 2024-08-12"
  },
  {
    Name: "GetUserRoles",
    Body: "SELECT r.RoleName FROM [Roles] r INNER JOIN [UserRoles] ur ON r.RoleID = ur.RoleID WHERE ur.UserID = @UserID;",
    Desc: "Retrieves all roles associated with a user.",
    Params: ["@UserID UNIQUEIDENTIFIER"],
    Returns: ["RoleName"],
    Refs: ["[UserRoles]", "[Roles]"],
    Meta: "Version 1.0 - Created on 2024-08-12"
  },
  {
    Name: "UpdateUserLastLogin",
    Body: "UPDATE [User] SET LastLoginDate = GETDATE() WHERE UserID = @UserID;",
    Desc: "Updates the last login date for a user.",
    Params: ["@UserID UNIQUEIDENTIFIER"],
    Returns: ["AffectedRows"],
    Refs: ["[User]"],
    Meta: "Version 1.0 - Created on 2024-08-12"
  },
  {
    Name: "GetUsersByRole",
    Body: "SELECT u.* FROM [User] u INNER JOIN [UserRoles] ur ON u.UserID = ur.UserID WHERE ur.RoleID = @RoleID;",
    Desc: "Retrieves all users associated with a specific role.",
    Params: ["@RoleID INT"],
    Returns: ["UserID", "FirstName", "LastName", "Email", "CreatedDate"],
    Refs: ["[User]", "[UserRoles]"],
    Meta: "Version 1.0 - Created on 2024-08-12"
  },
  {
    Name: "LogUserAction",
    Body: "INSERT INTO [UserActions] (UserID, Action, ActionDate) VALUES (@UserID, @Action, GETDATE());",
    Desc: "Logs a user's action in the UserActions table.",
    Params: ["@UserID UNIQUEIDENTIFIER", "@Action VARCHAR(255)"],
    Returns: ["AffectedRows"],
    Refs: ["[UserActions]"],
    Meta: "Version 1.0 - Created on 2024-08-12"
  }
];

