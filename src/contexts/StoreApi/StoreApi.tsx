import { create } from "zustand";
import { ApiState } from "./StoreApi.types";
import addIndex from "../../utils/addIndex";
import {
  ProductInterface,
  RateTypeInterface,
} from "../../services/products/products.types";
import {
  getAllProductsAsync,
  getRateTypeAsync,
} from "../../services/products/products";
import { getStationListAsync } from "../../services/stationMaster/stationMaster";
import { StationMasterInterface } from "../../services/stationMaster/stationMaster.types";
import { getTruckListAsync } from "../../services/truckMaster/truckMaster";
import { TruckNumberInterface } from "../../services/truckMaster/truckMaster.type";

import { getRateListAsync } from "../../services/rateMaster/rateMaster";
import { RateMasterInterface } from "../../services/rateMaster/rateMaster.type";

import { getGodownListAsync } from "../../services/godownMaster/godownMaster";
import { GodownMasterInterface } from "../../services/godownMaster/godownMaster.types";

import { getCompanyListAsync } from "../../services/companyMaster/companyMaster";
import { CompanyMasterInterface } from "../../services/companyMaster/companyMaster.type";

import {getLevyListAsync} from "../../services/levyMaster/levyMaster"
import {LevyMasterInterface} from "../../services/levyMaster/levyMaster.types"

import {
    getUserListAsync,
    getUserTypeListAsync,
  } from "../../services/user/user";

  import { UserMasterIneterface } from "../../services/user/user.types";

export const useApiStore = create<ApiState>((set, get) => ({
  StoreProducts: [],
  StoreRateTypes: [],
  StoreStation: [],
  StoreTruckNumber: [],
  StoreRateList: [],
  StoreGodownList: [],
  StoreUserList: [],
  StoreUserTypeList: [],
  StoreCompanyList: [],
  StoreLevyList: [],
  //-----------------------------------------------------------------------------------------------------------------

  getStoreAllProducts: async () => {
    const { StoreProducts } = get();

    if (StoreProducts.length !== 0) {
      return [...StoreProducts];
    } else {
      const response = await getAllProductsAsync();

      if (
        response &&
        typeof response !== "boolean" &&
        response.data.status !== 401
      ) {

        const sortedData = response.data.data.sort((a: any, b: any) => 
            a.productName.localeCompare(b.productName)
          );

        const data: ProductInterface[] = addIndex.addIndex1(
            sortedData
        )
    

        set({ StoreProducts: [...data] });
        return [...data];
      } else {
        return [];
      }
    }
  },

  setStoreProducts: (data) =>
    set((state) => {
      const newProducts =
        typeof data === "function" ? data(state.StoreProducts) : data;

      return {
        StoreProducts: [...newProducts],
      };
    }),

  // -------------------------------------------------------------------------------------------

  getStoreRateTypes: async () => {
    const { StoreRateTypes } = get();

    if (StoreRateTypes.length !== 0) {
      return [...StoreRateTypes];
    } else {
      const response = await getRateTypeAsync();

      if (
        response &&
        typeof response !== "boolean" &&
        response.data.status !== 401
      ) {
        
        const data: RateTypeInterface[] = addIndex.addIndex1(
          response.data.data.reverse()
        );

        set({ StoreRateTypes: [...data] });
        return [...data];
      } else {
        return [];
      }
    }
  },

  setStoreRateTypes: (data) =>
    set((state) => {
      const newRateTypes =
        typeof data === "function" ? data(state.StoreRateTypes) : data;

      return {
        StoreRateTypes: [...newRateTypes],
      };
    }),

  // --------------------------------------------------------------------------------------------

  getStoreStations: async () => {
    const { StoreStation } = get();

    if (StoreStation.length !== 0) {
      return [...StoreStation];
    } else {
      const response = await getStationListAsync();

      if (
        response &&
        typeof response !== "boolean" &&
        response.data.status !== 401
      ) {
        const sortedData = response.data.data.sort((a: any, b: any) => 
            a.stationName.localeCompare(b.stationName)
          );
        const data: StationMasterInterface[] = addIndex.addIndex1(
            sortedData
        );

        set({ StoreStation: [...data] });
        return [...data];
      } else {
        return [];
      }
    }
  },

  setStoreStations: (data) =>
    set((state) => {
      const newStation =
        typeof data === "function" ? data(state.StoreStation) : data;

      return {
        StoreStation: [...newStation],
      };
    }),
// ---------------------------------------------------------------------

  getStoreTruckNumbers: async () => {
    const { StoreTruckNumber } = get();

    if (StoreTruckNumber.length !== 0) {
      return [...StoreTruckNumber];
    } else {
      const response = await getTruckListAsync();

      if (
        response &&
        typeof response !== "boolean" &&
        response.data.status !== 401
      ) {
        const sortedData = response.data.data.sort((a: any, b: any) => 
            a.truckNumber.localeCompare(b.truckNumber)
          );
        const data: TruckNumberInterface[] = addIndex.addIndex1(
            sortedData
        );

        set({ StoreTruckNumber: [...data] });
        return [...data];
      } else {
        return [];
      }
    }
  },

  setStoreTruckNumbers: (data) =>
    set((state) => {
      const newTruckNumber =
        typeof data === "function" ? data(state.StoreTruckNumber) : data;

      return {
        StoreTruckNumber: [...newTruckNumber],
      };
    }),
// ---------------------------------------------------------------------
  
  getStoreRateList: async () => {
    const { StoreRateList } = get();

    if (StoreRateList.length !== 0) {
      return [...StoreRateList];
    } else {
      const response = await getRateListAsync();

      if (
        response &&
        typeof response !== "boolean" &&
        response.data.status !== 401
      ) {
        const data: RateMasterInterface[] = addIndex.addIndex1(
          response.data.data
        );

        set({ StoreRateList: [...data] });
        return [...data];
      } else {
        return [];
      }
    }
  },

  setStoreRateList: (data) =>
    set((state) => {
      const newRateList =
        typeof data === "function" ? data(state.StoreRateList) : data;

      return {
        StoreRateList: [...newRateList],
      };
    }),

    // -----------------------------------------------------------------------------------------------

  getStoreGodownList: async () => {
    const { StoreGodownList } = get();

    if (StoreGodownList.length !== 0) {
      return [...StoreGodownList];
    } else {
      const response = await getGodownListAsync();

      if (
        response &&
        typeof response !== "boolean" &&
        response.data.status !== 401
      ) {
        const sortedData = response.data.data.sort((a: any, b: any) => 
            a.godownName.localeCompare(b.godownName)
          );
        const data: GodownMasterInterface[] = addIndex.addIndex1(
            sortedData
        );

        set({ StoreGodownList: [...data] });
        return [...data];
      } else {
        return [];
      }
    }
  },

  setStoreGodownList: (data) =>
    set((state) => {
      const newGodownList =
        typeof data === "function" ? data(state.StoreGodownList) : data;

      return {
        StoreGodownList: [...newGodownList],
      };
    }),
 // -----------------------------------------------------------------------------------------------


 getStoreUserList: async () => {
    const { StoreUserList } = get();

    if (StoreUserList.length !== 0) {
      return [...StoreUserList];
    } else {
      const response = await getUserListAsync();

      if (
        response &&
        typeof response !== "boolean" &&
        response.data.status !== 401
      ) {
        const sortedData = response.data.data.sort((a: any, b: any) => 
            a.userName.localeCompare(b.userName)
          );
        const data: UserMasterIneterface[] = addIndex.addIndex1(
            sortedData
        
        );

        set({ StoreUserList: [...data] });
        return [...data];
      } else {
        return [];
      }
    }
  },

  setStoreUserList: (data) =>
    set((state) => {
      const newUserList =
        typeof data === "function" ? data(state.StoreUserList) : data;

      return {
        StoreUserList: [...newUserList],
      };
    }),
 // -----------------------------------------------------------------------------------------------


  getStoreUserTypeList: async () => {
    const { StoreUserTypeList } = get();

    if (StoreUserTypeList.length !== 0) {
      return [...StoreUserTypeList];
    } else {
      const response = await getUserTypeListAsync();

      if (
        response &&
        typeof response !== "boolean" &&
        response.data.status !== 401
      ) {
        const data: UserMasterIneterface[] = addIndex.addIndex1(
          response.data.data
        );

        set({ StoreUserTypeList: [...data] });
        return [...data];
      } else {
        return [];
      }
    }
  },

  setStoreUserTypeList: (data) =>
    set((state) => {
      const newUserTypeList =
        typeof data === "function" ? data(state.StoreUserTypeList) : data;

      return {
        StoreUserTypeList: [...newUserTypeList],
      };
    }),

    // -----------------------------------------------------------------------------------------------

  getStoreCompanyList: async () => {
    const { StoreCompanyList } = get();

    if (StoreCompanyList.length !== 0) {
      return [...StoreCompanyList];
    } else {
      const response = await getCompanyListAsync();

      if (
        response &&
        typeof response !== "boolean" &&
        response.data.status !== 401
      ) {
        const sortedData = response.data.data.sort((a: any, b: any) => 
            a.companyName.localeCompare(b.companyName)
          );
        const data: CompanyMasterInterface[] = addIndex.addIndex1(
            sortedData
        );

        set({ StoreCompanyList: [...data] });
        return [...data];
      } else {
        return [];
      }
    }
  },

  setStoreCompanyList: (data) =>
    set((state) => {
      const newCompanyList =
        typeof data === "function" ? data(state.StoreCompanyList) : data;

      return {
        StoreCompanyList: [...newCompanyList],
      };
    }),

    // -----------------------------------------------------------------------------------------------

  getStoreLevyList: async () => {
    const { StoreLevyList } = get();

    if (StoreLevyList.length !== 0) {
      return [...StoreLevyList];
    } else {
      const response = await getLevyListAsync();

      if (
        response &&
        typeof response !== "boolean" &&
        response.data.status !== 401
      ) {
       
        const data: LevyMasterInterface[] = addIndex.addIndex1(
          response.data.data
        );

        set({ StoreLevyList: [...data] });
        return [...data];
      } else {
        return [];
      }
    }
  },

  setStoreLevyList: (data) =>
    set((state) => {
      const newLevyList =
        typeof data === "function" ? data(state.StoreLevyList) : data;

      return {
        StoreLevyList: [...newLevyList],
      };
    }),








}));

//--------------------------------------------------------------------------
