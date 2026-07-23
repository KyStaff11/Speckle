export type UserRole = "designer" | "distributor";

export type Address = {
  street: string;
  province: string;
  country: string;
  postalCode: string;
};

export type DesignerProfile = {
  role: "designer";
  firstName: string;
  lastName: string;
  companyName: string;
  address: Address;
  email: string;
  referralCode: string;
};

export type DistributorProfile = {
  role: "distributor";
  companyName: string;
  contactFirstName: string;
  contactLastName: string;
  email: string;
  address: Address;
};

export type UserProfile = DesignerProfile | DistributorProfile;

export type DesignerSignUpInput = Omit<DesignerProfile, "referralCode">;
export type DistributorSignUpInput = DistributorProfile;
export type SignUpInput = DesignerSignUpInput | DistributorSignUpInput;
