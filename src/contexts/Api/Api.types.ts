// import { Dispatch, ReactNode, SetStateAction } from "react";

// import {
//   ProductInterface,
//   RateTypeInterface,
// } from "../../services/products/products.types";
// import { StationMasterInterface } from "../../services/stationMaster/stationMaster.types";
// import { TruckNumberInterface } from "../../services/truckMaster/truckMaster.type";
// import { RateMasterInterface } from "../../services/rateMaster/rateMaster.type";
// import { GodownMasterInterface } from "../../services/godownMaster/godownMaster.types";
// import { CompanyMasterInterface } from "../../services/companyMaster/companyMaster.type";
// import { UserMasterIneterface } from "../../services/user/user.types";
// import {LevyMasterInterface} from "../../services/levyMaster/levyMaster.types"


// export interface ApiContextInterface {
//   getAllProducts: () => Promise<ProductInterface[]>;
//   getRateTypes: () => Promise<RateTypeInterface[]>;
//   getNextInvoiceNo: () => Promise<number>;
//   getStationList: () => Promise<StationMasterInterface[]>;
//   getTruckList: () => Promise<TruckNumberInterface[]>;
//   getRateList: () => Promise<RateMasterInterface[]>;
//   getGodownList: () => Promise<GodownMasterInterface[]>;
//   getCompanyList: () => Promise<CompanyMasterInterface[]>;
//   getUserTypeList: () => Promise<UserMasterIneterface[]>;
//   getUserList: () => Promise<UserMasterIneterface[]>;
//   getLevyList: () => Promise<LevyMasterInterface[]>;

//   StoreProducts: ProductInterface[];
//   StoreRateTypes: RateTypeInterface[];
//   StoreStation: StationMasterInterface[];
//   StoreTruckNumber: TruckNumberInterface[];
//   StoreRateList: RateMasterInterface[];
//   StoreGodownList: GodownMasterInterface[];
//   StoreUserList: UserMasterIneterface[];
//   StoreUserTypeList: UserMasterIneterface[];
//   StoreCompanyList: CompanyMasterInterface[];
//   StoreLevyList: LevyMasterInterface[];



//   setAllProducts: (
//     newAllProducts:
//       | ProductInterface[]
//       | ((prev: ProductInterface[]) => ProductInterface[])
//   ) => void;

//   setRateType: (
//     newRateTypes:
//       | RateTypeInterface[]
//       | ((prev: RateTypeInterface[]) => RateTypeInterface[])
//   ) => void;

//   setNextInvoiceNo: Dispatch<SetStateAction<number>>;

//   setStationList: (
//     newStationList:
//       | StationMasterInterface[]
//       | ((prev: StationMasterInterface[]) => StationMasterInterface[])
//   ) => void;


//   setTruckList: (
//     newTruckList:
//       | TruckNumberInterface[]
//       | ((prev: TruckNumberInterface[]) => TruckNumberInterface[])
//   ) => void;


//   setRateList:  (
//     newRateList:
//       | RateMasterInterface[]
//       | ((prev: RateMasterInterface[]) => RateMasterInterface[])
//   ) => void;


//   setGodownList: (
//     newGodownList:
//       | GodownMasterInterface[]
//       | ((prev: GodownMasterInterface[]) => GodownMasterInterface[])
//   ) => void;

//   setCompanyList: (
//     newCompanyList:
//       | CompanyMasterInterface[]
//       | ((prev: CompanyMasterInterface[]) => CompanyMasterInterface[])
//   ) => void;


//   setUserTypeList:  (
//     newUserTypeList:
//       | UserMasterIneterface[]
//       | ((prev: UserMasterIneterface[]) => UserMasterIneterface[])
//   ) => void;


//   setUserList: (
//     newUserList:
//       | UserMasterIneterface[]
//       | ((prev: UserMasterIneterface[]) => UserMasterIneterface[])
//   ) => void;

//   setLevyList: (
//     newLevyList:
//       | LevyMasterInterface[]
//       | ((prev: LevyMasterInterface[]) => LevyMasterInterface[])
//   ) => void;
// }

// export interface ApiProviderInterface {
//   children: ReactNode;
// }
