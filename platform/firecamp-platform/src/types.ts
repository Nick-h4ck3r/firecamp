export enum EWorkspaceTypes {
  Personal = 1,
  Organizational = 2,
}

export enum EUserRolesOrganization {
  // Owner = 1, //TODO: for future use
  Admin = 2,
  Collaborator = 3,
}
export enum EUserRolesWorkspace {
  Owner = 1,
  Admin = 2,
  Collaborator = 3,
  Viewer = 4,
}
export enum EUserRolesCollection {
  Collaborator = 3,
  Viewer = 4,
}

// Modal
export enum EPlatformModalTypes {
  None = 'none', // Ideal type which represents no opened modal at all

  // organization
  CreateOrg = 'createOrg',
  OrgManagement = 'orgManagement',
  SwitchOrg = 'switchOrg',

  // workspace
  CreateWorkspace = 'createWorkspace',
  WorkspaceManagement = 'workspaceManagement',
  InviteMembers = 'inviteMembers',
  SwitchWorkspace = 'switchWorkspace',

  // request
  EditRequest = 'editRequest',

  // environment
  CreateEnvironment = 'createEnvironment',
  ManageEnvironment = 'manageEnvironment',

  // auth
  SignIn = 'signIn',
  SignInWithEmail = 'signInEmail',
  SignUp = 'signUp',
  RefreshToken = 'refreshToken',
  ForgotPassword = 'forgotPassword',
  ResetPassword = 'ResetPassword',

  // user
  UserProfile = 'userProfile',

  // cookie
  CookieManager = 'cookieManager',

  // ssl & proxy
  SslNProxy = 'sslNProxy',
}

export const EPlatformModalDefaultProps = {
  // organization
  [EPlatformModalTypes.CreateOrg]: { height: '50vh', width: '600px' },
  [EPlatformModalTypes.OrgManagement]: { height: '80vh', width: '600px' },
  [EPlatformModalTypes.SwitchOrg]: { width: '440px', className: 'p-0 !pb-6' },

  // workspace
  [EPlatformModalTypes.CreateWorkspace]: { height: '80vh', width: '600px' },
  [EPlatformModalTypes.WorkspaceManagement]: {
    height: '650px',
    width: '500px',
  },
  [EPlatformModalTypes.InviteMembers]: { height: '700px' },
  [EPlatformModalTypes.SwitchWorkspace]: {
    width: '440px',
    className: 'p-0 !pb-6',
  },

  // request
  [EPlatformModalTypes.EditRequest]: { height: '600px', width: '450px' },

  // environment
  [EPlatformModalTypes.CreateEnvironment]: { height: '750px', width: '500px' },
  [EPlatformModalTypes.ManageEnvironment]: { height: '750px', width: '550px' },

  // auth
  [EPlatformModalTypes.SignIn]: { width: '440px', className: 'p-8' },
  [EPlatformModalTypes.SignInWithEmail]: { width: '440px', className: 'p-8' },
  [EPlatformModalTypes.SignUp]: { width: '440px', className: 'p-8' },
  [EPlatformModalTypes.RefreshToken]: { modalConfig: { closeOnEsc: false } },
  [EPlatformModalTypes.ForgotPassword]: { width: '440px', className: 'p-8' },
  [EPlatformModalTypes.ResetPassword]: { width: '440px', className: 'p-8' },

  // user
  [EPlatformModalTypes.UserProfile]: {},

  // cookie
  [EPlatformModalTypes.CookieManager]: {},

  // ssl & proxy
  [EPlatformModalTypes.SslNProxy]: {},
};

export enum ECloudApiHeaders {
  Authorization = 'Authorization',
  SocketId = 'X-Socket-Id',
  ClientId = 'X-Client-Id',
  WorkspaceId = 'X-Workspace-Id',
  AppVersion = 'X-App-Version',
}

export enum ERegex {
  //@ref= https://stackabuse.com/validate-email-addresses-with-regular-expressions-in-javascript/
  Email = "([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])",
}

export const RE = {
  /**
   * don't allow any special character
   * @ref:  https://stackoverflow.com/a/23127284
   * allows: colName, colName_, _colNmae, col_name
   * not allow" colName. , colName?, colName/@ or any special character in the name
   */
  CollectionName: /^(?![\s\S]*[^\w -]+)[\s\S]*?$/im,
  // TODO: later merged both regex in one CollectionName & NoSpecialCharacters
  NoSpecialCharacters: /^(?![\s\S]*[^\w -]+)[\s\S]*?$/im,
};

export enum EThemeMode {
  Light = 'light',
  Dark = 'dark',
}

export enum EThemeColor {
  Green = 'green',
  Orange = 'orange',
}

export const DefaultTheme = {
  name: 'theme-light primary-orange',
  class: 'theme-light primary-orange',
  mode: EThemeMode.Light,
  color: EThemeColor.Orange,
};
