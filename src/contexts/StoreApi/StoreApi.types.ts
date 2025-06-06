import { ProductInterface, RateTypeInterface } from '../../services/products/products.types';
import { StationMasterInterface } from "../../services/stationMaster/stationMaster.types";
import { TruckNumberInterface } from "../../services/truckMaster/truckMaster.type";
import { RateMasterInterface } from "../../services/rateMaster/rateMaster.type";
import { GodownMasterInterface } from "../../services/godownMaster/godownMaster.types";
import { UserMasterIneterface } from "../../services/user/user.types";
import { CompanyMasterInterface } from "../../services/companyMaster/companyMaster.type";
import {LevyMasterInterface} from "../../services/levyMaster/levyMaster.types"
export interface ApiState {

    StoreProducts: ProductInterface[];
    StoreRateTypes: RateTypeInterface[];
    StoreStation: StationMasterInterface[];
    StoreTruckNumber: TruckNumberInterface[];
    StoreRateList: RateMasterInterface[];
    StoreGodownList: GodownMasterInterface[];
    StoreUserList: UserMasterIneterface[];
    StoreUserTypeList: UserMasterIneterface[];
    StoreCompanyList: CompanyMasterInterface[];
    StoreLevyList: LevyMasterInterface[];


    getStoreAllProducts: () => Promise<ProductInterface[]>;
    getStoreRateTypes: () => Promise<RateTypeInterface[]>;
    getStoreStations: () => Promise<StationMasterInterface[]>;
    getStoreTruckNumbers: () => Promise<TruckNumberInterface[]>;
    getStoreRateList: () => Promise<RateMasterInterface[]>;
    getStoreGodownList: () => Promise<GodownMasterInterface[]>;
    getStoreUserList: () => Promise<UserMasterIneterface[]>;
    getStoreUserTypeList: () => Promise<UserMasterIneterface[]>;
    getStoreCompanyList: () => Promise<CompanyMasterInterface[]>;
    getStoreLevyList: () => Promise<LevyMasterInterface[]>;



    setStoreProducts: (data: ProductInterface[] | ((prev: ProductInterface[]) => ProductInterface[])) => void;
    setStoreRateTypes: (data: RateTypeInterface[] | ((prev: RateTypeInterface[]) => RateTypeInterface[])) => void;
    setStoreStations: (data: StationMasterInterface[] | ((prev: StationMasterInterface[]) => StationMasterInterface[])) => void;
    setStoreTruckNumbers: (data: TruckNumberInterface[] | ((prev: TruckNumberInterface[]) => TruckNumberInterface[])) => void;
    setStoreRateList: (data: RateMasterInterface[] | ((prev: RateMasterInterface[]) => RateMasterInterface[])) => void;
    setStoreGodownList: (data: GodownMasterInterface[] | ((prev: GodownMasterInterface[]) => GodownMasterInterface[])) => void;
    setStoreUserList: (data: UserMasterIneterface[] | ((prev: UserMasterIneterface[]) => UserMasterIneterface[])) => void;
    setStoreUserTypeList: (data: UserMasterIneterface[] | ((prev: UserMasterIneterface[]) => UserMasterIneterface[])) => void;
    setStoreCompanyList: (data: CompanyMasterInterface[] | ((prev: CompanyMasterInterface[]) => CompanyMasterInterface[])) => void;
    setStoreLevyList: (data: LevyMasterInterface[] | ((prev: LevyMasterInterface[]) => LevyMasterInterface[])) => void;
}