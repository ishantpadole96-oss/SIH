const fs = require('fs');
const path = require('path');

// 36 Districts with realistic talukas, populations, and geo-coordinates
const districtsConfig = [
  {
    district: 'Pune',
    code: '020',
    centerLat: 18.52,
    centerLng: 73.85,
    talukas: [
      { name: 'Shivapur Gram', lat: 18.2851, lng: 73.8824, pop: 3450 },
      { name: 'Khed (Rajgurunagar)', lat: 18.8550, lng: 73.8820, pop: 21000 },
      { name: 'Manchar', lat: 18.3550, lng: 73.9450, pop: 14800 },
      { name: 'Velhe (Bhor Ghat)', lat: 18.2201, lng: 73.7905, pop: 2150 },
      { name: 'Bhor', lat: 18.1502, lng: 73.8504, pop: 19200 },
      { name: 'Saswad', lat: 18.3450, lng: 74.0300, pop: 12500 },
      { name: 'Jejuri', lat: 18.2750, lng: 74.1550, pop: 10200 },
      { name: 'Ghoti Khurd Tribal', lat: 18.2050, lng: 73.7300, pop: 1480 },
      { name: 'Narayangaon', lat: 19.1200, lng: 73.9800, pop: 16500 },
      { name: 'Junnar', lat: 19.2080, lng: 73.8760, pop: 24500 },
      { name: 'Baramati Rural', lat: 18.1550, lng: 74.5800, pop: 32000 },
      { name: 'Shirur', lat: 18.8250, lng: 74.3750, pop: 28000 },
      { name: 'Daund Rural', lat: 18.4650, lng: 74.5850, pop: 18500 },
      { name: 'Indapur', lat: 18.1100, lng: 75.0300, pop: 22000 },
      { name: 'Mulshi Paud', lat: 18.5200, lng: 73.6100, pop: 8500 },
      { name: 'Maval (Vadgaon)', lat: 18.7500, lng: 73.6500, pop: 17200 }
    ]
  },
  {
    district: 'Ahmednagar',
    code: '0241',
    centerLat: 19.09,
    centerLng: 74.74,
    talukas: [
      { name: 'Rahuri Gram', lat: 19.3920, lng: 74.6500, pop: 18500 },
      { name: 'Shirdi Rural', lat: 19.7660, lng: 74.4760, pop: 36000 },
      { name: 'Sangamner Rural', lat: 19.5770, lng: 74.2120, pop: 22000 },
      { name: 'Akole Tribal Hamlet', lat: 19.5420, lng: 73.9350, pop: 3100 },
      { name: 'Kopargaon Rural', lat: 19.8800, lng: 74.4800, pop: 24000 },
      { name: 'Shrirampur', lat: 19.6200, lng: 74.6600, pop: 27500 },
      { name: 'Newasa Rural', lat: 19.5500, lng: 74.9200, pop: 16800 },
      { name: 'Shevgaon', lat: 19.3500, lng: 75.2200, pop: 14200 },
      { name: 'Pathardi Hilly Gram', lat: 19.1700, lng: 75.1800, pop: 11900 },
      { name: 'Jamkhed Rural', lat: 18.7300, lng: 75.3200, pop: 13500 },
      { name: 'Karjat Ahmednagar', lat: 18.9100, lng: 75.0100, pop: 15400 },
      { name: 'Parner Rural', lat: 19.0000, lng: 74.4400, pop: 16200 }
    ]
  },
  {
    district: 'Akola',
    code: '0724',
    centerLat: 20.70,
    centerLng: 77.01,
    talukas: [
      { name: 'Murtizapur Rural', lat: 20.7320, lng: 77.3620, pop: 14500 },
      { name: 'Balapur Gram', lat: 20.6670, lng: 76.7720, pop: 12800 },
      { name: 'Patur Foothills', lat: 20.4570, lng: 76.9320, pop: 4200 },
      { name: 'Barshitakli Rural', lat: 20.5800, lng: 77.0600, pop: 9800 },
      { name: 'Akola Rural Mandol', lat: 20.7100, lng: 76.9900, pop: 26000 },
      { name: 'Telhara Cotton Belt', lat: 21.0300, lng: 76.8400, pop: 11500 },
      { name: 'Akot Satpura Edge', lat: 21.0900, lng: 77.0600, pop: 19800 }
    ]
  },
  {
    district: 'Amravati',
    code: '0721',
    centerLat: 20.93,
    centerLng: 77.75,
    talukas: [
      { name: 'Dharni (Melghat Tribal)', lat: 21.5200, lng: 76.9980, pop: 5800 },
      { name: 'Chikhaldara Hill Village', lat: 21.4020, lng: 77.3250, pop: 3300 },
      { name: 'Achalpur Rural', lat: 21.2580, lng: 77.5100, pop: 24000 },
      { name: 'Morshi Gram', lat: 21.3200, lng: 78.0100, pop: 16200 },
      { name: 'Warud Orange Belt', lat: 21.4600, lng: 78.2700, pop: 21000 },
      { name: 'Chandur Railway Gram', lat: 20.8100, lng: 77.9700, pop: 11400 },
      { name: 'Dhamangaon Railway', lat: 20.7800, lng: 78.1400, pop: 14800 },
      { name: 'Anjangaon Surji', lat: 21.1600, lng: 77.3100, pop: 18900 },
      { name: 'Daryapur Rural', lat: 20.9200, lng: 77.3200, pop: 13500 },
      { name: 'Nandgaon Khandeshwar', lat: 20.6800, lng: 77.8200, pop: 9200 }
    ]
  },
  {
    district: 'Chhatrapati Sambhajinagar',
    code: '0240',
    centerLat: 19.88,
    centerLng: 75.33,
    talukas: [
      { name: 'Paithan Rural', lat: 19.4800, lng: 75.3800, pop: 21000 },
      { name: 'Vaijapur Gram', lat: 19.9200, lng: 74.7300, pop: 18200 },
      { name: 'Gangapur Rural', lat: 19.7000, lng: 75.0100, pop: 14000 },
      { name: 'Sillod Gram', lat: 20.3000, lng: 75.6500, pop: 26500 },
      { name: 'Kannad Hilly Taluka', lat: 20.2600, lng: 75.1300, pop: 17800 },
      { name: 'Khuldabad Heritage Gram', lat: 20.0100, lng: 75.1800, pop: 9500 },
      { name: 'Soygaon Forest Border', lat: 20.5200, lng: 75.7600, pop: 6200 },
      { name: 'Phulambri Rural', lat: 20.0800, lng: 75.4200, pop: 12400 }
    ]
  },
  {
    district: 'Beed',
    code: '02442',
    centerLat: 18.99,
    centerLng: 75.76,
    talukas: [
      { name: 'Georai Rural', lat: 19.2600, lng: 75.7500, pop: 17500 },
      { name: 'Parli Vaijnath Rural', lat: 18.8500, lng: 76.5300, pop: 31000 },
      { name: 'Ashti Gram', lat: 18.8100, lng: 75.1700, pop: 8900 },
      { name: 'Patoda Drought Cluster', lat: 18.9100, lng: 75.5200, pop: 3400 },
      { name: 'Majalgaon Canal Belt', lat: 19.1500, lng: 76.2200, pop: 22500 },
      { name: 'Ambejogai Rural', lat: 18.7300, lng: 76.3800, pop: 28000 },
      { name: 'Kaij Rural Taluka', lat: 18.7000, lng: 76.0100, pop: 15600 },
      { name: 'Dharur Fort Gram', lat: 18.8200, lng: 76.1100, pop: 7800 },
      { name: 'Wadwani Gram', lat: 19.0100, lng: 76.0100, pop: 6400 },
      { name: 'Shirur Kasar', lat: 19.0600, lng: 75.3300, pop: 7100 }
    ]
  },
  {
    district: 'Bhandara',
    code: '07184',
    centerLat: 21.17,
    centerLng: 79.65,
    talukas: [
      { name: 'Tumsar Rural', lat: 21.3800, lng: 79.7400, pop: 19500 },
      { name: 'Sakoli Gram', lat: 21.0800, lng: 79.9800, pop: 12400 },
      { name: 'Pauni Riverbed Gram', lat: 20.7900, lng: 79.6300, pop: 7800 },
      { name: 'Mohadi Rice Belt', lat: 21.3100, lng: 79.6700, pop: 11200 },
      { name: 'Lakhani Rural', lat: 21.0900, lng: 79.8500, pop: 10400 },
      { name: 'Lakhandur Lake Belt', lat: 20.7600, lng: 79.9900, pop: 8900 }
    ]
  },
  {
    district: 'Buldhana',
    code: '07262',
    centerLat: 20.53,
    centerLng: 76.18,
    talukas: [
      { name: 'Khamgaon Rural', lat: 20.6800, lng: 76.5700, pop: 29000 },
      { name: 'Malkapur Gram', lat: 20.8800, lng: 76.2000, pop: 18200 },
      { name: 'Mehkar Rural', lat: 20.1500, lng: 76.5700, pop: 13900 },
      { name: 'Sindkhed Raja Historic Gram', lat: 19.9600, lng: 76.1400, pop: 6400 },
      { name: 'Chikhli Rural', lat: 20.3500, lng: 76.2500, pop: 21400 },
      { name: 'Shegaon Pilgrim Rural', lat: 20.7900, lng: 76.6900, pop: 27000 },
      { name: 'Jalgaon Jamod Satpura', lat: 21.0500, lng: 76.5300, pop: 12500 },
      { name: 'Sangrampur Tribal', lat: 21.1200, lng: 76.7100, pop: 5400 },
      { name: 'Lonar Crater Village', lat: 19.9800, lng: 76.5200, pop: 10800 },
      { name: 'Deulgaon Raja', lat: 20.0200, lng: 75.9300, pop: 13600 }
    ]
  },
  {
    district: 'Chandrapur',
    code: '07172',
    centerLat: 19.95,
    centerLng: 79.30,
    talukas: [
      { name: 'Warora Rural', lat: 20.2300, lng: 79.0000, pop: 22000 },
      { name: 'Ballarpur Gram', lat: 19.8500, lng: 79.3500, pop: 26000 },
      { name: 'Chimur Forest Border', lat: 20.4900, lng: 79.3700, pop: 8500 },
      { name: 'Korpurna Tribal Village', lat: 19.6800, lng: 79.2000, pop: 2900 },
      { name: 'Bhadravati Industrial Edge', lat: 20.1000, lng: 79.1200, pop: 17500 },
      { name: 'Rajura Coal Belt', lat: 19.7800, lng: 79.3600, pop: 15200 },
      { name: 'Mul Rice Taluka', lat: 20.0700, lng: 79.6700, pop: 12800 },
      { name: 'Nagbhid Lake Gram', lat: 20.5800, lng: 79.6600, pop: 10100 },
      { name: 'Brahmapuri Riverbed', lat: 20.6100, lng: 79.8500, pop: 18400 },
      { name: 'Sindewahi Forest Cluster', lat: 20.2800, lng: 79.6300, pop: 7400 }
    ]
  },
  {
    district: 'Dhule',
    code: '02562',
    centerLat: 20.90,
    centerLng: 74.78,
    talukas: [
      { name: 'Shirpur Rural', lat: 21.3500, lng: 74.8800, pop: 24000 },
      { name: 'Sakri Tribal Tehsil', lat: 20.9900, lng: 74.3200, pop: 9800 },
      { name: 'Sindkheda Gram', lat: 21.2800, lng: 74.7500, pop: 14200 },
      { name: 'Dhule Rural Taluka', lat: 20.9200, lng: 74.7100, pop: 21000 },
      { name: 'Nardana Industrial Belt', lat: 21.2300, lng: 74.8200, pop: 8400 },
      { name: 'Pimpalner Hill Village', lat: 20.9000, lng: 74.0500, pop: 6900 }
    ]
  },
  {
    district: 'Gadchiroli',
    code: '07132',
    centerLat: 20.18,
    centerLng: 80.00,
    talukas: [
      { name: 'Aheri Tribal Center', lat: 19.4100, lng: 80.0000, pop: 8200 },
      { name: 'Etapalli Deep Forest Village', lat: 19.6500, lng: 80.2800, pop: 2400 },
      { name: 'Kurkheda Gram', lat: 20.5800, lng: 80.2000, pop: 7600 },
      { name: 'Dhanora Tribal Border', lat: 20.3200, lng: 80.2800, pop: 3100 },
      { name: 'Bhamragad Remote Hamlet', lat: 19.2500, lng: 80.3700, pop: 1850 },
      { name: 'Chamorshi Riverine Gram', lat: 19.9300, lng: 79.9300, pop: 9800 },
      { name: 'Armori Rural', lat: 20.4600, lng: 79.9800, pop: 12500 },
      { name: 'Sironcha Border Junction', lat: 18.8300, lng: 79.9600, pop: 6800 },
      { name: 'Korchi Forest Hamlet', lat: 20.7300, lng: 80.4600, pop: 2100 },
      { name: 'Mulchera Tribal Area', lat: 19.6800, lng: 79.9900, pop: 3500 }
    ]
  },
  {
    district: 'Gondia',
    code: '07182',
    centerLat: 21.46,
    centerLng: 80.20,
    talukas: [
      { name: 'Tirora Rural', lat: 21.4100, lng: 79.9300, pop: 17800 },
      { name: 'Deori Forest Village', lat: 21.0800, lng: 80.3600, pop: 6900 },
      { name: 'Amgaon Gram', lat: 21.3700, lng: 80.3800, pop: 12100 },
      { name: 'Salekasa Tribal Edge', lat: 21.3100, lng: 80.5900, pop: 4800 },
      { name: 'Goregaon Rice Belt', lat: 21.3200, lng: 80.2200, pop: 9400 },
      { name: 'Sadak Arjuni Gram', lat: 21.1100, lng: 80.1500, pop: 8300 },
      { name: 'Arjuni Morgaon', lat: 20.7800, lng: 80.0100, pop: 11000 }
    ]
  },
  {
    district: 'Hingoli',
    code: '02456',
    centerLat: 19.72,
    centerLng: 77.15,
    talukas: [
      { name: 'Basmath Rural', lat: 19.5100, lng: 77.1600, pop: 19000 },
      { name: 'Kalamnuri Gram', lat: 19.6600, lng: 77.3100, pop: 11400 },
      { name: 'Aundha Nagnath Pilgrim Gram', lat: 19.5300, lng: 77.0400, pop: 7200 },
      { name: 'Sengaon Rural', lat: 19.8800, lng: 76.9800, pop: 8600 },
      { name: 'Hingoli Rural Outskirts', lat: 19.7400, lng: 77.1200, pop: 14500 }
    ]
  },
  {
    district: 'Jalgaon',
    code: '0257',
    centerLat: 21.00,
    centerLng: 75.56,
    talukas: [
      { name: 'Bhusawal Rural', lat: 21.0500, lng: 75.7700, pop: 34000 },
      { name: 'Chalisgaon Rural', lat: 20.4600, lng: 75.0100, pop: 28500 },
      { name: 'Amalner Gram', lat: 21.0400, lng: 75.0600, pop: 23000 },
      { name: 'Chopda Satpura Foothills', lat: 21.2500, lng: 75.3000, pop: 8900 },
      { name: 'Pachora Rural', lat: 20.6700, lng: 75.3500, pop: 19200 },
      { name: 'Raver Banana Belt', lat: 21.2400, lng: 76.0300, pop: 21400 },
      { name: 'Yawal Satpura Border', lat: 21.1700, lng: 75.6900, pop: 15600 },
      { name: 'Jamner Rural', lat: 20.8100, lng: 75.7800, pop: 16800 },
      { name: 'Erandol Historic Gram', lat: 20.9200, lng: 75.3300, pop: 12000 },
      { name: 'Parola Fort Town', lat: 20.8800, lng: 75.1200, pop: 13500 },
      { name: 'Bodwad Border Gram', lat: 20.8800, lng: 76.0000, pop: 9100 },
      { name: 'Bhadgaon Rural', lat: 20.6600, lng: 75.2200, pop: 11800 }
    ]
  },
  {
    district: 'Jalna',
    code: '02482',
    centerLat: 19.84,
    centerLng: 75.88,
    talukas: [
      { name: 'Partur Rural', lat: 19.5900, lng: 76.2100, pop: 18000 },
      { name: 'Ambad Gram', lat: 19.6100, lng: 75.7800, pop: 14500 },
      { name: 'Bhokardan Rural', lat: 20.2500, lng: 75.7700, pop: 12200 },
      { name: 'Ghansawangi Rural', lat: 19.5200, lng: 75.9800, pop: 9800 },
      { name: 'Jafrabad Border Gram', lat: 20.1900, lng: 75.9900, pop: 8500 },
      { name: 'Mantha Agrarian Taluka', lat: 19.7200, lng: 76.3800, pop: 10400 },
      { name: 'Badnapur Rural', lat: 19.8700, lng: 75.7200, pop: 11500 }
    ]
  },
  {
    district: 'Kolhapur',
    code: '0231',
    centerLat: 16.70,
    centerLng: 74.24,
    talukas: [
      { name: 'Radhanagari Wildlife Foothills', lat: 16.4100, lng: 73.9900, pop: 6200 },
      { name: 'Ichalkaranji Rural', lat: 16.7000, lng: 74.4600, pop: 38000 },
      { name: 'Gadhinglaj Rural', lat: 16.2300, lng: 74.3500, pop: 21500 },
      { name: 'Panhala Hill Village', lat: 16.8100, lng: 74.1100, pop: 8400 },
      { name: 'Shahuwadi Western Ghats', lat: 16.9000, lng: 73.9400, pop: 5100 },
      { name: 'Bhudargad (Gargoti)', lat: 16.3100, lng: 74.1400, pop: 11200 },
      { name: 'Ajra Hill Gram', lat: 16.1100, lng: 74.2100, pop: 7800 },
      { name: 'Chandgad Border Taluka', lat: 15.9300, lng: 74.3800, pop: 8900 },
      { name: 'Kagal Sugar Belt', lat: 16.5800, lng: 74.3100, pop: 18200 },
      { name: 'Hatkanangale Rural', lat: 16.7500, lng: 74.4400, pop: 24500 },
      { name: 'Shirol Panchganga Belt', lat: 16.7200, lng: 74.6000, pop: 22000 }
    ]
  },
  {
    district: 'Latur',
    code: '02382',
    centerLat: 18.40,
    centerLng: 76.58,
    talukas: [
      { name: 'Udgir Rural', lat: 18.3900, lng: 77.1200, pop: 26000 },
      { name: 'Nilanga Gram', lat: 18.1200, lng: 76.7600, pop: 19200 },
      { name: 'Ausa Historic Village', lat: 18.2500, lng: 76.5000, pop: 11500 },
      { name: 'Ahmadpur Rural', lat: 18.7000, lng: 76.9300, pop: 16800 },
      { name: 'Chakur Rural', lat: 18.5200, lng: 76.8800, pop: 10400 },
      { name: 'Deoni Border Gram', lat: 18.2500, lng: 77.0800, pop: 7600 },
      { name: 'Shirur Anantpal', lat: 18.3300, lng: 76.9000, pop: 6900 },
      { name: 'Jalkot Remote Gram', lat: 18.6300, lng: 77.1900, pop: 5400 },
      { name: 'Renapur Rural', lat: 18.5500, lng: 76.6200, pop: 8800 }
    ]
  },
  {
    district: 'Mumbai City',
    code: '022',
    centerLat: 18.96,
    centerLng: 72.83,
    talukas: [
      { name: 'Dharavi Coastal Periphery', lat: 19.0400, lng: 72.8550, pop: 38000 },
      { name: 'Colaba Waterfront Settlement', lat: 18.9100, lng: 72.8150, pop: 24000 },
      { name: 'Worli Koliwada', lat: 19.0180, lng: 72.8130, pop: 19500 },
      { name: 'Byculla Municipal Cluster', lat: 18.9750, lng: 72.8300, pop: 31000 }
    ]
  },
  {
    district: 'Mumbai Suburban',
    code: '022',
    centerLat: 19.11,
    centerLng: 72.86,
    talukas: [
      { name: 'Gorai Fishing Village', lat: 19.2300, lng: 72.7800, pop: 7500 },
      { name: 'Mankhurd Transit Cluster', lat: 19.0600, lng: 72.9300, pop: 42000 },
      { name: 'Kurla West Transit Gram', lat: 19.0700, lng: 72.8750, pop: 36000 },
      { name: 'Marve Malad Coastal Hamlet', lat: 19.1950, lng: 72.8050, pop: 12000 },
      { name: 'Bhandup Hill Slope Pocket', lat: 19.1550, lng: 72.9300, pop: 29000 }
    ]
  },
  {
    district: 'Nagpur',
    code: '0712',
    centerLat: 21.14,
    centerLng: 79.08,
    talukas: [
      { name: 'Ramtek Rural', lat: 21.4000, lng: 79.3300, pop: 21000 },
      { name: 'Katol Orange Belt Gram', lat: 21.2700, lng: 78.5800, pop: 24500 },
      { name: 'Umred Mining Gram', lat: 20.8500, lng: 79.3300, pop: 18200 },
      { name: 'Kuhi Tribal Border', lat: 20.9800, lng: 79.3500, pop: 4800 },
      { name: 'Saoner Coal Taluka', lat: 21.3800, lng: 78.9100, pop: 19400 },
      { name: 'Kalmeshwar Industrial Edge', lat: 21.2300, lng: 78.9100, pop: 15600 },
      { name: 'Narkhed Border Town', lat: 21.4800, lng: 78.5300, pop: 14000 },
      { name: 'Mouda Thermal Belt', lat: 21.2700, lng: 79.3900, pop: 13100 },
      { name: 'Kamptee Rural', lat: 21.2200, lng: 79.1900, pop: 22000 },
      { name: 'Bhiwapur Forest Edge', lat: 20.7600, lng: 79.5200, pop: 7900 },
      { name: 'Parseoni Pench Buffer', lat: 21.3800, lng: 79.2000, pop: 6800 },
      { name: 'Hingna Rural', lat: 21.0500, lng: 78.9600, pop: 17500 }
    ]
  },
  {
    district: 'Nanded',
    code: '02462',
    centerLat: 19.15,
    centerLng: 77.30,
    talukas: [
      { name: 'Kinwat Tribal Belt', lat: 19.6300, lng: 78.2000, pop: 7400 },
      { name: 'Deglur Border Town', lat: 18.5500, lng: 77.5800, pop: 22000 },
      { name: 'Mukhed Rural', lat: 18.7200, lng: 77.3700, pop: 15400 },
      { name: 'Kandhar Fort Gram', lat: 18.9500, lng: 77.2000, pop: 16800 },
      { name: 'Hadgaon Godavari Belt', lat: 19.5000, lng: 77.6700, pop: 14200 },
      { name: 'Biloli Border Rural', lat: 18.7700, lng: 77.7300, pop: 12500 },
      { name: 'Loha Agrarian Gram', lat: 18.9500, lng: 77.1200, pop: 13900 },
      { name: 'Mudkhed Railway Junction', lat: 19.1700, lng: 77.5200, pop: 11000 },
      { name: 'Bhokar Forest Edge', lat: 19.2200, lng: 77.6800, pop: 9800 },
      { name: 'Mahur Pilgrim Hills', lat: 19.8300, lng: 77.9100, pop: 6500 },
      { name: 'Dharmabad Border Town', lat: 18.9000, lng: 77.8500, pop: 13000 }
    ]
  },
  {
    district: 'Nandurbar',
    code: '02564',
    centerLat: 21.37,
    centerLng: 74.24,
    talukas: [
      { name: 'Dhadgaon (Akrani Tribal)', lat: 21.6500, lng: 74.2200, pop: 4200 },
      { name: 'Molgi Hilly Hamlet', lat: 21.6800, lng: 74.0100, pop: 2100 },
      { name: 'Shahada Rural', lat: 21.5500, lng: 74.4700, pop: 28000 },
      { name: 'Navapur Forest Border', lat: 21.1700, lng: 73.8000, pop: 13500 },
      { name: 'Taloda Tribal Belt', lat: 21.5700, lng: 74.2100, pop: 11200 },
      { name: 'Nandurbar Rural Outskirts', lat: 21.3900, lng: 74.2100, pop: 22000 }
    ]
  },
  {
    district: 'Nashik',
    code: '0253',
    centerLat: 19.99,
    centerLng: 73.78,
    talukas: [
      { name: 'Trimbakeshwar Rural', lat: 19.9300, lng: 73.5300, pop: 16000 },
      { name: 'Kalwan Tribal Center', lat: 20.4900, lng: 74.0200, pop: 8800 },
      { name: 'Surgana Remote Ghat', lat: 20.5700, lng: 73.6200, pop: 3100 },
      { name: 'Igatpuri Hill Village', lat: 19.6900, lng: 73.5600, pop: 14200 },
      { name: 'Malegaon Rural Belt', lat: 20.5500, lng: 74.5200, pop: 39000 },
      { name: 'Niphad Onion Belt', lat: 20.0800, lng: 74.1100, pop: 24000 },
      { name: 'Sinnar Industrial Gram', lat: 19.8400, lng: 73.9900, pop: 27500 },
      { name: 'Yeola Paithani Gram', lat: 20.0400, lng: 74.4800, pop: 21000 },
      { name: 'Chandwad Fort Valley', lat: 20.3300, lng: 74.2400, pop: 13600 },
      { name: 'Nandgaon Railway Gram', lat: 20.3100, lng: 74.6600, pop: 12800 },
      { name: 'Satana (Baglan) Tribal', lat: 20.5900, lng: 74.2000, pop: 18500 },
      { name: 'Deola Rural', lat: 20.4500, lng: 74.1900, pop: 9400 },
      { name: 'Dindori Tribal Vineyard', lat: 20.2000, lng: 73.8300, pop: 15200 },
      { name: 'Peint Deep Forest Hamlet', lat: 20.2600, lng: 73.5000, pop: 4100 }
    ]
  },
  {
    district: 'Dharashiv',
    code: '02472',
    centerLat: 18.18,
    centerLng: 76.04,
    talukas: [
      { name: 'Tuljapur Pilgrim Rural', lat: 18.0100, lng: 76.0700, pop: 23500 },
      { name: 'Omerga Border Gram', lat: 17.8400, lng: 76.6200, pop: 17800 },
      { name: 'Kallam Rural', lat: 18.5000, lng: 75.9500, pop: 13200 },
      { name: 'Paranda Historic Fort Gram', lat: 18.2600, lng: 75.4500, pop: 11000 },
      { name: 'Bhoom Hilly Valley', lat: 18.4700, lng: 75.6700, pop: 8400 },
      { name: 'Lohara Border Gram', lat: 17.9300, lng: 76.3800, pop: 7200 },
      { name: 'Washi Drought Belt', lat: 18.6100, lng: 75.7800, pop: 6900 }
    ]
  },
  {
    district: 'Palghar',
    code: '02525',
    centerLat: 19.70,
    centerLng: 72.77,
    talukas: [
      { name: 'Jawhar Hill Station (Tribal)', lat: 19.9200, lng: 73.2300, pop: 8900 },
      { name: 'Mokhada Tribal Hamlet', lat: 19.9300, lng: 73.3400, pop: 3400 },
      { name: 'Dahanu Coastal Gram', lat: 19.9700, lng: 72.7300, pop: 27000 },
      { name: 'Wada Forest Taluka', lat: 19.6500, lng: 73.1400, pop: 14500 },
      { name: 'Talasari Border Tribal Area', lat: 20.1300, lng: 72.9200, pop: 4600 },
      { name: 'Vikramgad Forest Belt', lat: 19.8000, lng: 73.1000, pop: 7400 },
      { name: 'Manor River Junction', lat: 19.7400, lng: 72.9100, pop: 9800 },
      { name: 'Palghar Rural Coast', lat: 19.6900, lng: 72.7300, pop: 23000 }
    ]
  },
  {
    district: 'Parbhani',
    code: '02452',
    centerLat: 19.27,
    centerLng: 76.77,
    talukas: [
      { name: 'Gangakhed Rural', lat: 18.9500, lng: 76.7500, pop: 21500 },
      { name: 'Jintur Gram', lat: 19.6100, lng: 76.6900, pop: 16800 },
      { name: 'Selu Rural', lat: 19.4600, lng: 76.4400, pop: 12900 },
      { name: 'Pathri Pilgrim Gram', lat: 19.2500, lng: 76.4500, pop: 11400 },
      { name: 'Palam Cotton Village', lat: 18.9900, lng: 76.9900, pop: 7800 },
      { name: 'Purna Railway Taluka', lat: 19.1800, lng: 77.0500, pop: 15200 },
      { name: 'Sonpeth River Belt', lat: 19.0300, lng: 76.4600, pop: 6900 },
      { name: 'Manwath Grain Market', lat: 19.3100, lng: 76.5100, pop: 10500 }
    ]
  },
  {
    district: 'Raigad',
    code: '02141',
    centerLat: 18.51,
    centerLng: 73.18,
    talukas: [
      { name: 'Mahad Rural', lat: 18.0800, lng: 73.4200, pop: 25000 },
      { name: 'Roha Gram', lat: 18.4300, lng: 73.1200, pop: 18400 },
      { name: 'Poladpur Ghat Village', lat: 17.9800, lng: 73.4600, pop: 5200 },
      { name: 'Mangaon Rural', lat: 18.2500, lng: 73.2800, pop: 16000 },
      { name: 'Alibag Coastal Rural', lat: 18.6500, lng: 72.8800, pop: 22000 },
      { name: 'Murud Coastal Fishing', lat: 18.3300, lng: 72.9600, pop: 8900 },
      { name: 'Shrivardhan Beach Gram', lat: 18.0400, lng: 73.0100, pop: 10400 },
      { name: 'Mhasla Creek Village', lat: 18.1300, lng: 73.1200, pop: 6800 },
      { name: 'Tala Hill Gram', lat: 18.1800, lng: 73.2000, pop: 4500 },
      { name: 'Pen Agrarian Taluka', lat: 18.7400, lng: 73.0900, pop: 17800 },
      { name: 'Karjat Raigad Valley', lat: 18.9100, lng: 73.3300, pop: 21500 },
      { name: 'Khalapur Industrial Belt', lat: 18.8300, lng: 73.2900, pop: 14200 }
    ]
  },
  {
    district: 'Ratnagiri',
    code: '02352',
    centerLat: 16.99,
    centerLng: 73.31,
    talukas: [
      { name: 'Chiplun Rural', lat: 17.5300, lng: 73.5100, pop: 31000 },
      { name: 'Dapoli Coastal Gram', lat: 17.7600, lng: 73.1800, pop: 15600 },
      { name: 'Guhagar Beach Village', lat: 17.4800, lng: 73.1900, pop: 7800 },
      { name: 'Rajapur Rural', lat: 16.6600, lng: 73.5200, pop: 9800 },
      { name: 'Khed Ratnagiri Riverbed', lat: 17.7200, lng: 73.3900, pop: 19500 },
      { name: 'Mandangad Fort Border', lat: 17.9800, lng: 73.2500, pop: 5400 },
      { name: 'Sangameshwar Ghat', lat: 17.1900, lng: 73.5500, pop: 11000 },
      { name: 'Lanja Highway Taluka', lat: 16.8500, lng: 73.5500, pop: 8900 }
    ]
  },
  {
    district: 'Sangli',
    code: '0233',
    centerLat: 16.85,
    centerLng: 74.58,
    talukas: [
      { name: 'Miraj Rural', lat: 16.8300, lng: 74.6400, pop: 35000 },
      { name: 'Tasgaon Grape Belt', lat: 17.0300, lng: 74.6000, pop: 22000 },
      { name: 'Jath Drought Belt (Remote)', lat: 17.0400, lng: 75.2200, pop: 6800 },
      { name: 'Shirala Hilly Village', lat: 16.9800, lng: 74.1300, pop: 8400 },
      { name: 'Islampur (Walwa)', lat: 17.0500, lng: 74.2700, pop: 29000 },
      { name: 'Atpadi Arid Taluka', lat: 17.4200, lng: 74.9500, pop: 7600 },
      { name: 'Kavathe Mahankal', lat: 17.0100, lng: 74.8600, pop: 11200 },
      { name: 'Khanapur (Vita)', lat: 17.2700, lng: 74.5400, pop: 16500 },
      { name: 'Kadegaon Rural', lat: 17.3000, lng: 74.3300, pop: 12800 },
      { name: 'Palus Krishna Basin', lat: 17.1000, lng: 74.4500, pop: 14900 }
    ]
  },
  {
    district: 'Satara',
    code: '02162',
    centerLat: 17.68,
    centerLng: 74.00,
    talukas: [
      { name: 'Karad Rural', lat: 17.2900, lng: 74.1800, pop: 34000 },
      { name: 'Wai Rural', lat: 17.9500, lng: 73.8900, pop: 18500 },
      { name: 'Mahabaleshwar Rural Ghat', lat: 17.9200, lng: 73.6600, pop: 4900 },
      { name: 'Patan Koyna Valley (Hilly)', lat: 17.3700, lng: 73.9000, pop: 3800 },
      { name: 'Phaltan Rural', lat: 17.9900, lng: 74.4300, pop: 28000 },
      { name: 'Koregaon Rural', lat: 17.7000, lng: 74.1700, pop: 15400 },
      { name: 'Khatav (Vaduj)', lat: 17.6000, lng: 74.4500, pop: 11200 },
      { name: 'Man (Dahiwadi)', lat: 17.7000, lng: 74.7500, pop: 8900 },
      { name: 'Jawali (Medha) Ghat', lat: 17.7500, lng: 73.8200, pop: 4200 },
      { name: 'Khandala Industrial Gram', lat: 18.0600, lng: 74.0200, pop: 13000 }
    ]
  },
  {
    district: 'Sindhudurg',
    code: '02362',
    centerLat: 16.12,
    centerLng: 73.70,
    talukas: [
      { name: 'Sawantwadi Rural', lat: 15.9100, lng: 73.8200, pop: 21000 },
      { name: 'Kankavli Gram', lat: 16.2700, lng: 73.7100, pop: 19500 },
      { name: 'Malvan Coastal Village', lat: 16.0600, lng: 73.4700, pop: 11200 },
      { name: 'Dodamarg Forest Hamlet', lat: 15.7700, lng: 73.9800, pop: 3600 },
      { name: 'Kudal Central Taluka', lat: 16.0100, lng: 73.6900, pop: 17400 },
      { name: 'Vengurla Beach Gram', lat: 15.8600, lng: 73.6400, pop: 9800 },
      { name: 'Devgad Alphonso Belt', lat: 16.3700, lng: 73.3800, pop: 12000 },
      { name: 'Vaibhavwadi Ghat Pass', lat: 16.5300, lng: 73.7200, pop: 5100 }
    ]
  },
  {
    district: 'Solapur',
    code: '0217',
    centerLat: 17.66,
    centerLng: 75.91,
    talukas: [
      { name: 'Pandharpur Rural', lat: 17.6800, lng: 75.3200, pop: 38000 },
      { name: 'Barshi Rural', lat: 18.2300, lng: 75.6900, pop: 29000 },
      { name: 'Akkalkot Border Gram', lat: 17.5200, lng: 76.2000, pop: 16500 },
      { name: 'Karmala Dry Belt Gram', lat: 18.4100, lng: 75.2000, pop: 8900 },
      { name: 'Sangola Pomegranate Belt', lat: 17.4300, lng: 75.2000, pop: 15600 },
      { name: 'Mangalwedha Gram', lat: 17.5100, lng: 75.4500, pop: 11400 },
      { name: 'Madha Central Taluka', lat: 18.0300, lng: 75.5200, pop: 14800 },
      { name: 'Mohol Highway Gram', lat: 17.8100, lng: 75.6500, pop: 13500 },
      { name: 'South Solapur Rural', lat: 17.5500, lng: 75.9500, pop: 19800 },
      { name: 'North Solapur Border', lat: 17.7800, lng: 75.8800, pop: 21000 },
      { name: 'Malshiras Agrarian', lat: 17.8500, lng: 74.9300, pop: 17200 }
    ]
  },
  {
    district: 'Thane',
    code: '022',
    centerLat: 19.22,
    centerLng: 72.98,
    talukas: [
      { name: 'Shahapur Rural Tribal Area', lat: 19.4500, lng: 73.3300, pop: 16800 },
      { name: 'Murbad Gram', lat: 19.2500, lng: 73.4000, pop: 13500 },
      { name: 'Bhiwandi Rural Periphery', lat: 19.3000, lng: 73.0600, pop: 31000 },
      { name: 'Kalyan Rural Gram', lat: 19.2400, lng: 73.1300, pop: 27500 },
      { name: 'Ambernath Rural', lat: 19.1900, lng: 73.2000, pop: 22000 },
      { name: 'Badlapur Foothills', lat: 19.1400, lng: 73.2600, pop: 18000 }
    ]
  },
  {
    district: 'Wardha',
    code: '07152',
    centerLat: 20.74,
    centerLng: 78.60,
    talukas: [
      { name: 'Sevagram Rural Heritage', lat: 20.7200, lng: 78.6500, pop: 14000 },
      { name: 'Hinganghat Rural', lat: 20.5700, lng: 78.8400, pop: 26000 },
      { name: 'Arvi Cotton Belt Gram', lat: 20.9900, lng: 78.2300, pop: 12500 },
      { name: 'Deoli Agrarian Taluka', lat: 20.6500, lng: 78.4800, pop: 11000 },
      { name: 'Seloo Rural Gram', lat: 20.8400, lng: 78.7000, pop: 9500 },
      { name: 'Samudrapur Rural', lat: 20.6100, lng: 78.9800, pop: 8400 },
      { name: 'Ashti Wardha Border', lat: 21.2000, lng: 78.1800, pop: 6900 },
      { name: 'Karanja Ghadge Forest', lat: 21.1800, lng: 78.5000, pop: 7800 }
    ]
  },
  {
    district: 'Washim',
    code: '07252',
    centerLat: 20.11,
    centerLng: 77.13,
    talukas: [
      { name: 'Karanja Lad Rural', lat: 20.4800, lng: 77.4900, pop: 21000 },
      { name: 'Risod Gram', lat: 19.9700, lng: 76.7800, pop: 15400 },
      { name: 'Mangrulpir Rural', lat: 20.3200, lng: 77.3400, pop: 9800 },
      { name: 'Malegaon Washim Rural', lat: 20.2500, lng: 76.9800, pop: 13200 },
      { name: 'Manora Hill Taluka', lat: 20.2100, lng: 77.5500, pop: 7400 },
      { name: 'Washim Rural Periphery', lat: 20.1300, lng: 77.1100, pop: 18500 }
    ]
  },
  {
    district: 'Yavatmal',
    code: '07232',
    centerLat: 20.39,
    centerLng: 78.12,
    talukas: [
      { name: 'Pusad Rural', lat: 19.9100, lng: 77.5800, pop: 28000 },
      { name: 'Pandharkawada (Kelapur Tribal)', lat: 20.0200, lng: 78.5300, pop: 9400 },
      { name: 'Umarkhed Border Gram', lat: 19.6000, lng: 77.7000, pop: 17500 },
      { name: 'Ghatanji Tribal Valley', lat: 20.1400, lng: 78.3200, pop: 4200 },
      { name: 'Wani Coal & Cotton Belt', lat: 20.0600, lng: 78.9500, pop: 24000 },
      { name: 'Digras Rural Gram', lat: 20.1100, lng: 77.7200, pop: 13500 },
      { name: 'Darwha Central Taluka', lat: 20.3100, lng: 77.7700, pop: 15200 },
      { name: 'Ralegaon Cotton Belt', lat: 20.4200, lng: 78.5100, pop: 10800 },
      { name: 'Babhulgaon Rural', lat: 20.5300, lng: 78.3200, pop: 8100 },
      { name: 'Kalamb Agrarian Gram', lat: 20.4700, lng: 78.3400, pop: 7600 },
      { name: 'Arni Highway Gram', lat: 20.0800, lng: 77.9400, pop: 12000 },
      { name: 'Maregaon Tribal Gram', lat: 20.0300, lng: 78.7800, pop: 5800 },
      { name: 'Zari Jamani Border', lat: 19.8200, lng: 78.7100, pop: 4500 },
      { name: 'Ner Rural Gram', lat: 20.4800, lng: 77.8900, pop: 11400 },
      { name: 'Mahagaon Rural', lat: 19.8400, lng: 77.8700, pop: 9900 }
    ]
  }
];

let villageId = 1;
const maharashtraVillages = [];
const maharashtraFacilities = [];
let facilityId = 1;

districtsConfig.forEach((dist) => {
  const districtName = dist.district;
  const telCode = dist.code;

  dist.talukas.forEach((t, idx) => {
    const vId = villageId++;
    const v = {
      id: vId,
      name: t.name,
      district: districtName,
      state: 'Maharashtra',
      population: t.pop,
      lat: Math.round(t.lat * 10000) / 10000,
      lng: Math.round(t.lng * 10000) / 10000,
      accessibility: 50.0 // will be dynamically computed via refreshAllVillageScores()
    };
    maharashtraVillages.push(v);

    // Create healthcare facilities for each taluka / location
    if (idx === 0) {
      // Main district civil or sub-district tertiary hospital
      const fId = facilityId++;
      maharashtraFacilities.push({
        id: fId,
        name: `${districtName} District Civil / General Hospital`,
        type: 'Government Hospital',
        address: `Civil Lines, Main Road, ${t.name}, ${districtName}`,
        vid: vId,
        lat: Math.round((t.lat + 0.003) * 10000) / 10000,
        lng: Math.round((t.lng + 0.003) * 10000) / 10000,
        contact: `${telCode}-2${Math.floor(200000 + Math.random() * 700000)}`,
        hours: '24 Hours',
        status: 'Open',
        emer: 1,
        tot: 250 + Math.floor(Math.random() * 150),
        avail: 40 + Math.floor(Math.random() * 60)
      });
    }

    if (idx === 1 || idx === 2) {
      // Sub-district hospital
      const fId = facilityId++;
      maharashtraFacilities.push({
        id: fId,
        name: `${t.name.split(' ')[0]} Sub-District Hospital`,
        type: 'Sub-District Hospital',
        address: `Station Road, ${t.name}, ${districtName}`,
        vid: vId,
        lat: Math.round((t.lat + 0.002) * 10000) / 10000,
        lng: Math.round((t.lng + 0.002) * 10000) / 10000,
        contact: `${telCode}-2${Math.floor(200000 + Math.random() * 700000)}`,
        hours: '24 Hours',
        status: 'Open',
        emer: 1,
        tot: 60 + Math.floor(Math.random() * 40),
        avail: 15 + Math.floor(Math.random() * 20)
      });
    } else if (idx === 3 || idx === 4) {
      // Community Health Centre (CHC)
      const fId = facilityId++;
      maharashtraFacilities.push({
        id: fId,
        name: `${t.name.split(' ')[0]} Community Health Centre (CHC)`,
        type: 'CHC',
        address: `Bypass Road, ${t.name}, ${districtName}`,
        vid: vId,
        lat: Math.round((t.lat + 0.0015) * 10000) / 10000,
        lng: Math.round((t.lng + 0.0015) * 10000) / 10000,
        contact: `${telCode}-2${Math.floor(200000 + Math.random() * 700000)}`,
        hours: '24 Hours',
        status: 'Open',
        emer: 1,
        tot: 30 + Math.floor(Math.random() * 20),
        avail: 8 + Math.floor(Math.random() * 12)
      });
    } else if (idx % 2 === 1) {
      // Primary Health Centre (PHC)
      const fId = facilityId++;
      maharashtraFacilities.push({
        id: fId,
        name: `${t.name.split(' ')[0]} Primary Health Centre`,
        type: 'PHC',
        address: `Gram Panchayat Chowk, ${t.name}, ${districtName}`,
        vid: vId,
        lat: Math.round((t.lat + 0.001) * 10000) / 10000,
        lng: Math.round((t.lng + 0.001) * 10000) / 10000,
        contact: `${telCode}-2${Math.floor(200000 + Math.random() * 700000)}`,
        hours: '24 Hours',
        status: 'Open',
        emer: 1,
        tot: 12 + Math.floor(Math.random() * 8),
        avail: 4 + Math.floor(Math.random() * 6)
      });
    } else {
      // Village Health Sub-Centre
      const fId = facilityId++;
      maharashtraFacilities.push({
        id: fId,
        name: `${t.name.split(' ')[0]} Health Sub-Centre`,
        type: 'Sub-Centre',
        address: `Zilla Parishad School Road, ${t.name}, ${districtName}`,
        vid: vId,
        lat: Math.round((t.lat + 0.0008) * 10000) / 10000,
        lng: Math.round((t.lng + 0.0008) * 10000) / 10000,
        contact: `${telCode}-2${Math.floor(200000 + Math.random() * 700000)}`,
        hours: '08:00 AM - 04:00 PM',
        status: 'Open',
        emer: 0,
        tot: 2 + Math.floor(Math.random() * 4),
        avail: 1 + Math.floor(Math.random() * 3)
      });
    }
  });
});

console.log(`Generated ${maharashtraVillages.length} Villages and ${maharashtraFacilities.length} Healthcare Facilities across all 36 Districts of Maharashtra.`);

const targetPath = path.join(__dirname, 'maharashtraData.js');
const fileContent = `/**
 * Massive Comprehensive Dataset for all 36 Districts of Maharashtra
 * Generated automatically covering Konkan, Paschim Maharashtra, Khandesh,
 * Marathwada, West Vidarbha, and East Vidarbha divisions.
 */

const maharashtraVillages = ${JSON.stringify(maharashtraVillages, null, 2)};

const maharashtraFacilities = ${JSON.stringify(maharashtraFacilities, null, 2)};

module.exports = {
  maharashtraVillages,
  maharashtraFacilities
};
`;

fs.writeFileSync(targetPath, fileContent, 'utf8');
console.log('Successfully saved maharashtraData.js!');
