import { Component, inject, signal, computed } from '@angular/core';
import { ServerConfiguratorApi } from './data-access/server-configurator-api';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NotificationStore } from '../../core/store/notification-store';

@Component({
  selector: 'app-server-configurator',
  imports: [FormsModule],
  templateUrl: './server-configurator.html',
  styleUrl: './server-configurator.scss',
})
export class ServerConfigurator {
  private notificationStore = inject(NotificationStore);

  private apiService = inject(ServerConfiguratorApi);
  private activatedRoute = inject(ActivatedRoute);

  data = signal<any>(null);
  isLoading = signal<boolean>(true);

  payForYear = signal<boolean>(false);
  dataBusInitial = signal<any>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    let id = this.activatedRoute.snapshot.paramMap.get('id');
    this.apiService.getData(id).subscribe({
      next: (data) => {
        this.dataBusInitial.set(structuredClone(data.data.data?.bus));
        this.data.set(data.data.data);
        this.isLoading.set(false);
        this.notificationStore.addNotification('Data received successfully');
      },
      error: (err) => {
        console.log(err.message);
        this.isLoading.set(false);
        this.notificationStore.addNotification('Error receiving data');
      }
    });
  }

  totalPriceChassis = computed(() => {
    let totalPriceMonth = this.data()?.container?.price;
    let totalPriceYear = this.payForYear() ? (totalPriceMonth * .9) : totalPriceMonth;
    return {
      month: totalPriceMonth,
      total: Math.round(totalPriceYear * 100) / 100
    }
  });

  setCpuModel(e: any) {
    this.data.set({
      ...this.data(),
      cpu: {
        ...this.data().cpu,
        partId: +e.target.value
      }
    })
  }

  setCpuNumber(e: any) {
    this.data.set({
      ...this.data(),
      cpu: {
        ...this.data().cpu,
        cpuInstallNumber: e.target.value
      }
    })
  }

  totalPriceCPU = computed(() => {
    let cpu = this.data()?.cpu?.cpuCanBeInstall.find((el: any) => {
      return el.id == this.data().cpu.partId;
    })
    let totalPriceServerMonth = cpu && cpu?.price * this.data()?.cpu?.cpuInstallNumber;
    let totalPriceServerYear = this.payForYear() ? (totalPriceServerMonth * .9) : totalPriceServerMonth;
    return {
      month: totalPriceServerMonth,
      total: Math.round(totalPriceServerYear * 100) / 100
    }
  });

  setRam(e: any) {
    if (e.target.value < this.data().ram.required * this.data().ram.min) {
      e.target.value = this.data().ram.required * this.data().ram.min;
    }
    this.data.set({
      ...this.data(),
      ram: {
        ...this.data().ram,
        value: e.target.value
      }
    })
  }

  totalPriceRam = computed(() => {
    let totalPriceMonth = this.data().ram?.part?.price * (this.data().ram?.value / this.data().ram?.min);
    let totalPriceYear = this.payForYear() ? (totalPriceMonth * .9) : totalPriceMonth;
    return {
      month: totalPriceMonth,
      total: Math.round(totalPriceYear * 100) / 100
    }
  });


  setDrives(e: any, index: any, slotType: any) {
    let slots = this.data().drives.drivesSlots.map((slot: any, ind: any) => {
      if (ind == index) {
        if (e.target.value == 'null') {
          slot.part_id = null;
          slot.price = 0;
          slot.total_price = 0;
          slot.total_price12 = 0;
          slot.occup_cells = 0;
        } else {
          let selectedDrive = slot.canBeInstall.find((drive: any) => {
            return drive.id == e.target.value;
          })
          if (selectedDrive == undefined) {
            console.error('setDrives: can not find drive for DRIVES ', e.target.value);
          } else {
            slot.part_id = +e.target.value;
            slot.price = selectedDrive.price;
            slot.total_price = selectedDrive.price;
            slot.total_price12 = Math.round((selectedDrive.price * .9) * 100) / 100;
            slot.occup_cells = selectedDrive.class_desc.cells;
          }
        }
      }
      return slot;
    })
    //START: Checking the availability of all SATA drives for installation (for all drives and bus slots)     
    let busSlots = structuredClone(this.data()?.bus?.slots) || null;
    let { drives_slots, bus_slots } = this.checkAvailabilitySataDrives(slots, busSlots);
    //END: Checking the availability of all SATA drives for installation (for all drives and bus slots)
    let newData = {
      ...this.data(),
      drives: {
        ...this.data().drives,
        drivesSlots: drives_slots
      }
    }
    if (busSlots != null) {
      newData.bus = {
        ...this.data().bus,
        slots: bus_slots
      }
    }
    this.data.set(newData);
  }
  checkAvailabilitySataDrives(drivesSlots: [any] | null = null, busSlots: [any] | null = null) {
    let basketsSum = this.data()?.drives?.baskets != undefined && this.data().drives.baskets.reduce((acc: any, el: any) => {
      acc += el;
      return acc;
    }, 0);
    let drivesSlotsData = drivesSlots != null && drivesSlots.reduce((acc: any, el: any) => {
      acc.cellsOccup += el.occup_cells;
      if (el.type == 'SATA' && el.part_id != null) {
        acc.slotsOccup++;
      }
      return acc;
    }, { cellsOccup: 0, slotsOccup: 0 });
    let busSlotsData = busSlots != null && busSlots.reduce((acc, busSlot) => {
      busSlot.boards.forEach((board: any) => {
        board.driveSlots.forEach((driveSlot: any) => {
          acc.cellsOccup += driveSlot.occup_cells;
          if (driveSlot.type == 'SATA' && driveSlot.part_id != null) {
            acc.slotsOccup++;
          }
        })
      });
      return acc;
    }, { cellsOccup: 0, slotsOccup: 0 });
    let slotsOccup = (drivesSlotsData.slotsOccup ?? 0);
    let checkMaxParts = this.data().drives.cells.max_parts >= (slotsOccup + 1);
    let cellsOccup = (drivesSlotsData.cellsOccup ?? 0) + (busSlotsData.cellsOccup ?? 0);
    let cellsFree = this.data().drives.cells.count - cellsOccup;

    let drives_slots = null;
    drivesSlots != null && (drives_slots = drivesSlots.map((slot) => {
      let canBeInstall = slot.canBeInstall;
      if (slot.type == 'SATA') {
        canBeInstall = canBeInstall.map((drive: any) => {
          let available = true;
          // by how much does the total number of occupied cells increase when this disk is installed
          let increasCells = drive.class_desc.cells - slot.occup_cells;

          if (this.data().drives.baskets != undefined) {
            // Checking disk inaccessibility by baskets
            let diskInaccessibilityBaskets = (cellsOccup + increasCells) > basketsSum;

            if (this.data()?.drives?.baskets?.length > slotsOccup) {
              if (checkMaxParts == false) {
                if (slot.part_id != null) {
                  diskInaccessibilityBaskets && (available = false);
                } else {
                  available = false;
                }
              } else {
                diskInaccessibilityBaskets && (available = false);
              }
            } else if (this.data()?.drives?.baskets?.length == slotsOccup) {
              if (slot.part_id != null) {
                diskInaccessibilityBaskets && (available = false);
              } else {
                available = false;
              }
            } else if (this.data()?.drives?.baskets?.length < slotsOccup) {
              console.error('checkAvailabilitySataDrives: error check available disk by baskets');
            }

          } else {
            // Checking disk inaccessibility by cells
            let diskInaccessibilityCells = increasCells > cellsFree;
            if (this.data().drives.cells.count > cellsOccup) {
              if (checkMaxParts == false) {
                if (slot.part_id != null) {
                  diskInaccessibilityCells && (available = false);
                } else {
                  available = false;
                }
              } else {
                diskInaccessibilityCells && (available = false);
              }
            } else if (this.data().drives.cells.count == cellsOccup) {
              if (slot.part_id != null) {
                diskInaccessibilityCells && (available = false);
              } else {
                available = false;
              }
            } else if (this.data().drives.cells.count < cellsOccup) {
              console.error('checkAvailabilitySataDrives: error check available disk by cells');
            }
          }
          return {
            ...drive,
            available: available
          };
        })
      }
      return {
        ...slot,
        canBeInstall: canBeInstall
      };
    }));
    let bus_slots = null;
    busSlots != null && (bus_slots = busSlots.map((busSlot) => {
      let boards = busSlot.boards.map((board: any) => {
        let driveSlots = board.driveSlots.map((driveSlot: any) => {
          let drives = driveSlot.drives;
          if (driveSlot.type == 'SATA') {
            drives = drives.map((drive: any) => {
              let available = true;
              let increasCells = drive.class_desc.cells - driveSlot.occup_cells;
              if (this.data().drives.baskets != undefined) {
                let diskInaccessibilityBaskets = (cellsOccup + increasCells) > basketsSum;
                if (this.data()?.drives?.baskets?.length > slotsOccup) {
                  diskInaccessibilityBaskets && (available = false);
                } else if (this.data()?.drives?.baskets?.length == slotsOccup) {
                  if (driveSlot.part_id != null) {
                    diskInaccessibilityBaskets && (available = false);
                  } else {
                    available = false;
                  }
                } else if (this.data()?.drives?.baskets?.length < slotsOccup) {
                  console.error('checkAvailabilitySataDrives for BUS: error check available disk by baskets');
                }
              } else {
                let diskInaccessibilityCells = increasCells > cellsFree;
                if (this.data().drives.cells.count > cellsOccup) {
                  if (checkMaxParts == false) {
                    if (driveSlot.part_id != null) {
                      diskInaccessibilityCells && (available = false);
                    } else {
                      available = false;
                    }
                  } else {
                    diskInaccessibilityCells && (available = false);
                  }
                } else if (this.data().drives.cells.count == cellsOccup) {
                  if (driveSlot.part_id != null) {
                    diskInaccessibilityCells && (available = false);
                  } else {
                    available = false;
                  }
                } else if (this.data().drives.cells.count < cellsOccup) {
                  console.error('checkAvailabilitySataDrives for BUS: error check available disk by cells');
                }
              }

              return {
                ...drive,
                available: available
              };
            })
          }
          return {
            ...driveSlot,
            drives: drives
          };
        })

        return {
          ...board,
          driveSlots: driveSlots
        };
      });

      return {
        ...busSlot,
        boards: boards
      };
    }));
    return { drives_slots, bus_slots }
  }

  setBus(e: any, slotIndex: any) {
    let busSlotsClone = structuredClone(this.data().bus.slots);
    let busSlots = busSlotsClone.map((busSlot: any, ind: any) => {
      if (ind == slotIndex) {
        if (e.target.value == 'null') {
          busSlot.part_id = null;
          busSlot.price = 0;
          busSlot.total_price = 0;
          busSlot.total_price12 = 0;
          busSlot.selectedBusIndex = null;
        } else {
          let selectedBusIndex = busSlot.boards.findIndex((bus: any) => {
            return bus.id == e.target.value;
          });
          let selectedBus = selectedBusIndex != undefined && busSlot.boards[selectedBusIndex];
          if (selectedBus == false) {
            console.error('setBus: can not find bus ', e.target.value);
          } else {
            busSlot.part_id = +e.target.value;
            busSlot.price = selectedBus.price;
            busSlot.total_price = selectedBus.price;
            busSlot.total_price12 = Math.round((selectedBus.price * .9) * 100) / 100;
            busSlot.selectedBusIndex = selectedBusIndex;
          }
        }
        //START: setting the disk slots of all other expansion cards to the initial values ​​received from the server
        let slotBoards = structuredClone(busSlot.boards).map((board: any) => {
          if (board.id != e.target.value) {
            let dataBoardInitial = this.dataBusInitial().slots[slotIndex].boards.find((el: any) => el.id == board.id);
            if (dataBoardInitial == undefined) {
              console.error('setBus: can not find board in dataBusInitial ', board.id);
            } else {
              board.driveSlots = dataBoardInitial.driveSlots;
            }
          }
          return board;
        });
        busSlot.boards = slotBoards;
        //END: setting the disk slots of all other expansion cards to the initial values ​​received from the server
      }

      return busSlot;
    })

    //START: Checking the availability of all SATA drives for installation (for all drives and bus slots)
    let drivesSlots = structuredClone(this.data()?.drives?.drivesSlots) || null;
    let { drives_slots, bus_slots } = this.checkAvailabilitySataDrives(drivesSlots, busSlots);
    //END: Checking the availability of all SATA drives for installation (for all drives and bus slots)

    this.data.set({
      ...this.data(),
      bus: {
        ...this.data().bus,
        slots: bus_slots
      },
      drives: {
        ...this.data().drives,
        drivesSlots: drives_slots
      }
    })
  }

  setBusDrive(e: any, indexDriveSlot: any, indexBusSlot: any, indexBord: any) {
    let busSlots = structuredClone(this.data().bus.slots);
    let busSlot = busSlots[indexBusSlot];
    let boards = busSlot.boards;
    let board = boards[indexBord];
    let driveSlots = board.driveSlots;
    let driveSlot = driveSlots[indexDriveSlot];
    if (e.target.value == 'null') {
      driveSlot.part_id = null;
      driveSlot.price = 0;
      driveSlot.total_price = 0;
      driveSlot.total_price12 = 0;
      driveSlot.occup_cells = 0;
    } else {
      let selectedDriveIndex = driveSlot.drives.findIndex((drive: any) => {
        return drive.id == e.target.value;
      });
      let selectedDrive = selectedDriveIndex != undefined && driveSlot.drives[selectedDriveIndex];
      if (selectedDrive == undefined) {
        console.error("setBusDrive: can't find bus drive", e.target.value);
      } else {
        driveSlot.part_id = +e.target.value;
        driveSlot.price = selectedDrive.price;
        driveSlot.total_price = selectedDrive.price;
        driveSlot.total_price12 = Math.round((selectedDrive.price * .9) * 100) / 100;
        driveSlot.occup_cells = selectedDrive.class_desc.cells;
      }
    }

    //START: Checking the availability of all SATA drives for installation (for all drives and bus slots)
    let drivesSlots = structuredClone(this.data()?.drives?.drivesSlots) || null;
    let { drives_slots, bus_slots } = this.checkAvailabilitySataDrives(drivesSlots, busSlots);
    //END: Checking the availability of all SATA drives for installation (for all drives and bus slots)

    this.data.set({
      ...this.data(),
      bus: {
        ...this.data().bus,
        slots: bus_slots
      },
      drives: {
        ...this.data().drives,
        drivesSlots: drives_slots
      }
    })
  }

  setOs(e: any) {
    let soft = structuredClone(this.data().soft);
    soft.forEach((el: any) => {
      if (!el.for_os.includes(e.target.value)) {
        el.checked = false;
      }
    })
    this.data.set({
      ...this.data(),
      os: e.target.value,
      soft: [...soft]
    })
  }

  setNumberIp(e: any) {
    e.target.value = e.target.value.replace(/\D/g, "");
    e.target.value = e.target.value.replace(/^0/g, "");
    if (e.target.value >= 101) {
      let replacer = e.target.value.match(/(.{1,3})/);
      e.target.value = e.target.value.replace(/(.{4,})/g, replacer[0]);
    }
    let qt = +e.target.value;
    let total_price = qt * +this.data().ip.price;
    total_price = Math.round(total_price * 100) / 100
    let total_price12 = qt * +this.data().ip.price12 * 12;
    total_price12 = Math.round(total_price12 * 100) / 100;
    this.data.set({
      ...this.data(),
      ip: {
        ...this.data().ip,
        qt,
        total_price,
        total_price12
      }
    })
  }

  setSoft(e: any, index: any) {
    let soft = structuredClone(this.data().soft);
    soft[index].checked = e.target.checked;
    this.data.set({
      ...this.data(),
      soft: [...soft]
    })
  }

  totalPriceServer = computed(() => {
    let res = 0;
    if (this.data().server.class != 'container') {
      let totalServerPriceMonth = this.data().server.price!;
      let totalServerPriceYear = this.payForYear() ? (totalServerPriceMonth * .9) : totalServerPriceMonth;
      let totalServerPrice = {
        month: totalServerPriceMonth,
        total: Math.round(totalServerPriceYear * 100) / 100
      }
      res += totalServerPrice.total;
    } else if (this.data().server.class == 'container') {
      res += this.totalPriceChassis().total;

      if (this.data().cpu != undefined) {
        res += this.totalPriceCPU().total;
      }

      res += this.totalPriceRam().total;

      let drivesPrice = this.data().drives?.drivesSlots.reduce((acc: any, slot: any) => {
        if (slot.part_id != null) {
          acc += this.payForYear() ? slot.total_price12 : slot.total_price;
        }
        return acc;
      }, 0);
      res += drivesPrice!;

      if (this.data()?.bus?.slots != undefined) {
        let busPrice = this.data().bus?.slots.reduce((acc: any, busSlot: any) => {
          if (busSlot.part_id != null) {
            acc += this.payForYear() ? busSlot.total_price12 : busSlot.total_price;
            let installedBus = busSlot.boards.find((board: any) => {
              return board.id == busSlot.part_id;
            })
            if (installedBus == undefined) {
              console.error('totalPriceServer ', 'error in busPrice');
            } else {
              installedBus.driveSlots.forEach((driveSlot: any) => {
                if (driveSlot.part_id != null) {
                  acc += this.payForYear() ? driveSlot.total_price12 : driveSlot.total_price;
                }
              })
            }
          }
          return acc;
        }, 0);
        res += busPrice;
      }
    }
    return Math.round(res * 100) / 100;
  })

  totalOrderPrice = computed(() => {
    let res = this.totalPriceServer();

    res = this.payForYear() ? res * 12 : res;
    res += this.payForYear() ? this.data().ip.total_price12! : this.data().ip.total_price!;

    res += this.data().soft.reduce((acc: any, el: any) => {
      if (el.checked === true) {
        let price = this.payForYear() ? el.price12m * 12 : el.price;
        acc += price;
      }
      return acc;
    }, 0);

    return Math.round(res * 100) / 100;
  })

}