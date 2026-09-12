/**
 * Comprehensive Dataset for all 36 Districts of Maharashtra
 * Covering Konkan, Paschim Maharashtra, Khandesh/North Maharashtra,
 * Marathwada, West Vidarbha, and East Vidarbha divisions.
 */

const maharashtraVillages = [
  // --- 1. Pune District ---
  { id: 1, name: 'Shivapur', district: 'Pune', state: 'Maharashtra', population: 3450, lat: 18.2851, lng: 73.8824, accessibility: 42.5 },
  { id: 2, name: 'Khed (Rajgurunagar)', district: 'Pune', state: 'Maharashtra', population: 8900, lat: 18.3204, lng: 73.9102, accessibility: 79.5 },
  { id: 3, name: 'Manchar', district: 'Pune', state: 'Maharashtra', population: 14800, lat: 18.3550, lng: 73.9450, accessibility: 88.0 },
  { id: 4, name: 'Velhe', district: 'Pune', state: 'Maharashtra', population: 2150, lat: 18.2201, lng: 73.7905, accessibility: 28.5 },
  { id: 5, name: 'Bhor', district: 'Pune', state: 'Maharashtra', population: 19200, lat: 18.1502, lng: 73.8504, accessibility: 91.5 },
  { id: 6, name: 'Saswad', district: 'Pune', state: 'Maharashtra', population: 12500, lat: 18.3450, lng: 74.0300, accessibility: 71.0 },
  { id: 7, name: 'Jejuri', district: 'Pune', state: 'Maharashtra', population: 10200, lat: 18.2750, lng: 74.1550, accessibility: 66.5 },
  { id: 8, name: 'Ghoti Khurd', district: 'Pune', state: 'Maharashtra', population: 1480, lat: 18.2050, lng: 73.7300, accessibility: 22.0 },
  { id: 9, name: 'Narayangaon', district: 'Pune', state: 'Maharashtra', population: 16500, lat: 19.1200, lng: 73.9800, accessibility: 82.5 },
  { id: 10, name: 'Junnar', district: 'Pune', state: 'Maharashtra', population: 24500, lat: 19.2080, lng: 73.8760, accessibility: 85.0 },
  { id: 11, name: 'Baramati Rural', district: 'Pune', state: 'Maharashtra', population: 32000, lat: 18.1550, lng: 74.5800, accessibility: 93.0 },
  { id: 12, name: 'Shirur Rural', district: 'Pune', state: 'Maharashtra', population: 28000, lat: 18.8250, lng: 74.3750, accessibility: 89.0 },

  // --- 2. Ahmednagar (Ahilyanagar) ---
  { id: 13, name: 'Rahuri Gram', district: 'Ahmednagar', state: 'Maharashtra', population: 18500, lat: 19.3920, lng: 74.6500, accessibility: 72.0 },
  { id: 14, name: 'Shirdi Rural', district: 'Ahmednagar', state: 'Maharashtra', population: 36000, lat: 19.7660, lng: 74.4760, accessibility: 94.0 },
  { id: 15, name: 'Sangamner Rural', district: 'Ahmednagar', state: 'Maharashtra', population: 22000, lat: 19.5770, lng: 74.2120, accessibility: 83.0 },
  { id: 16, name: 'Akole Tribal Hamlet', district: 'Ahmednagar', state: 'Maharashtra', population: 3100, lat: 19.5420, lng: 73.9350, accessibility: 31.0 },

  // --- 3. Akola ---
  { id: 17, name: 'Murtizapur Rural', district: 'Akola', state: 'Maharashtra', population: 14500, lat: 20.7320, lng: 77.3620, accessibility: 75.0 },
  { id: 18, name: 'Balapur Gram', district: 'Akola', state: 'Maharashtra', population: 12800, lat: 20.6670, lng: 76.7720, accessibility: 68.0 },
  { id: 19, name: 'Patur Foothills', district: 'Akola', state: 'Maharashtra', population: 4200, lat: 20.4570, lng: 76.9320, accessibility: 44.0 },

  // --- 4. Amravati ---
  { id: 20, name: 'Dharni (Melghat Tribal)', district: 'Amravati', state: 'Maharashtra', population: 5800, lat: 21.5200, lng: 76.9980, accessibility: 24.0 },
  { id: 21, name: 'Chikhaldara Hill Village', district: 'Amravati', state: 'Maharashtra', population: 3300, lat: 21.4020, lng: 77.3250, accessibility: 29.0 },
  { id: 22, name: 'Achalpur Rural', district: 'Amravati', state: 'Maharashtra', population: 24000, lat: 21.2580, lng: 77.5100, accessibility: 81.0 },
  { id: 23, name: 'Morshi Gram', district: 'Amravati', state: 'Maharashtra', population: 16200, lat: 21.3200, lng: 78.0100, accessibility: 70.0 },

  // --- 5. Chhatrapati Sambhajinagar (Aurangabad) ---
  { id: 24, name: 'Paithan Rural', district: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', population: 21000, lat: 19.4800, lng: 75.3800, accessibility: 80.0 },
  { id: 25, name: 'Vaijapur Gram', district: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', population: 18200, lat: 19.9200, lng: 74.7300, accessibility: 77.0 },
  { id: 26, name: 'Gangapur Rural', district: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', population: 14000, lat: 19.7000, lng: 75.0100, accessibility: 69.0 },
  { id: 27, name: 'Sillod Gram', district: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', population: 26500, lat: 20.3000, lng: 75.6500, accessibility: 84.0 },

  // --- 6. Beed ---
  { id: 28, name: 'Georai Rural', district: 'Beed', state: 'Maharashtra', population: 17500, lat: 19.2600, lng: 75.7500, accessibility: 71.0 },
  { id: 29, name: 'Parli Vaijnath Rural', district: 'Beed', state: 'Maharashtra', population: 31000, lat: 18.8500, lng: 76.5300, accessibility: 86.0 },
  { id: 30, name: 'Ashti Gram', district: 'Beed', state: 'Maharashtra', population: 8900, lat: 18.8100, lng: 75.1700, accessibility: 58.0 },
  { id: 31, name: 'Patoda Drought Cluster', district: 'Beed', state: 'Maharashtra', population: 3400, lat: 18.9100, lng: 75.5200, accessibility: 36.0 },

  // --- 7. Bhandara ---
  { id: 32, name: 'Tumsar Rural', district: 'Bhandara', state: 'Maharashtra', population: 19500, lat: 21.3800, lng: 79.7400, accessibility: 78.0 },
  { id: 33, name: 'Sakoli Gram', district: 'Bhandara', state: 'Maharashtra', population: 12400, lat: 21.0800, lng: 79.9800, accessibility: 65.0 },
  { id: 34, name: 'Pauni Riverbed Gram', district: 'Bhandara', state: 'Maharashtra', population: 7800, lat: 20.7900, lng: 79.6300, accessibility: 52.0 },

  // --- 8. Buldhana ---
  { id: 35, name: 'Khamgaon Rural', district: 'Buldhana', state: 'Maharashtra', population: 29000, lat: 20.6800, lng: 76.5700, accessibility: 85.0 },
  { id: 36, name: 'Malkapur Gram', district: 'Buldhana', state: 'Maharashtra', population: 18200, lat: 20.8800, lng: 76.2000, accessibility: 74.0 },
  { id: 37, name: 'Mehkar Rural', district: 'Buldhana', state: 'Maharashtra', population: 13900, lat: 20.1500, lng: 76.5700, accessibility: 62.0 },
  { id: 38, name: 'Sindkhed Raja Historic Gram', district: 'Buldhana', state: 'Maharashtra', population: 6400, lat: 19.9600, lng: 76.1400, accessibility: 47.0 },

  // --- 9. Chandrapur ---
  { id: 39, name: 'Warora Rural', district: 'Chandrapur', state: 'Maharashtra', population: 22000, lat: 20.2300, lng: 79.0000, accessibility: 79.0 },
  { id: 40, name: 'Ballarpur Gram', district: 'Chandrapur', state: 'Maharashtra', population: 26000, lat: 19.8500, lng: 79.3500, accessibility: 83.0 },
  { id: 41, name: 'Chimur Forest Border', district: 'Chandrapur', state: 'Maharashtra', population: 8500, lat: 20.4900, lng: 79.3700, accessibility: 48.0 },
  { id: 42, name: 'Korpurna Tribal Village', district: 'Chandrapur', state: 'Maharashtra', population: 2900, lat: 19.6800, lng: 79.2000, accessibility: 33.0 },

  // --- 10. Dhule ---
  { id: 43, name: 'Shirpur Rural', district: 'Dhule', state: 'Maharashtra', population: 24000, lat: 21.3500, lng: 74.8800, accessibility: 82.0 },
  { id: 44, name: 'Sakri Tribal Tehsil', district: 'Dhule', state: 'Maharashtra', population: 9800, lat: 20.9900, lng: 74.3200, accessibility: 45.0 },
  { id: 45, name: 'Sindkheda Gram', district: 'Dhule', state: 'Maharashtra', population: 14200, lat: 21.2800, lng: 74.7500, accessibility: 69.0 },

  // --- 11. Gadchiroli (Dense forest & tribal belt) ---
  { id: 46, name: 'Aheri Tribal Center', district: 'Gadchiroli', state: 'Maharashtra', population: 8200, lat: 19.4100, lng: 80.0000, accessibility: 38.0 },
  { id: 47, name: 'Etapalli Deep Forest Village', district: 'Gadchiroli', state: 'Maharashtra', population: 2400, lat: 19.6500, lng: 80.2800, accessibility: 19.0 },
  { id: 48, name: 'Kurkheda Gram', district: 'Gadchiroli', state: 'Maharashtra', population: 7600, lat: 20.5800, lng: 80.2000, accessibility: 49.0 },
  { id: 49, name: 'Dhanora Tribal Border', district: 'Gadchiroli', state: 'Maharashtra', population: 3100, lat: 20.3200, lng: 80.2800, accessibility: 25.0 },
  { id: 50, name: 'Bhamragad Remote Hamlet', district: 'Gadchiroli', state: 'Maharashtra', population: 1850, lat: 19.2500, lng: 80.3700, accessibility: 14.0 },

  // --- 12. Gondia ---
  { id: 51, name: 'Tirora Rural', district: 'Gondia', state: 'Maharashtra', population: 17800, lat: 21.4100, lng: 79.9300, accessibility: 73.0 },
  { id: 52, name: 'Deori Forest Village', district: 'Gondia', state: 'Maharashtra', population: 6900, lat: 21.0800, lng: 80.3600, accessibility: 41.0 },
  { id: 53, name: 'Amgaon Gram', district: 'Gondia', state: 'Maharashtra', population: 12100, lat: 21.3700, lng: 80.3800, accessibility: 64.0 },

  // --- 13. Hingoli ---
  { id: 54, name: 'Basmath Rural', district: 'Hingoli', state: 'Maharashtra', population: 19000, lat: 19.5100, lng: 77.1600, accessibility: 76.0 },
  { id: 55, name: 'Kalamnuri Gram', district: 'Hingoli', state: 'Maharashtra', population: 11400, lat: 19.6600, lng: 77.3100, accessibility: 61.0 },
  { id: 56, name: 'Aundha Nagnath Pilgrim Gram', district: 'Hingoli', state: 'Maharashtra', population: 7200, lat: 19.5300, lng: 77.0400, accessibility: 59.0 },

  // --- 14. Jalgaon ---
  { id: 57, name: 'Bhusawal Rural', district: 'Jalgaon', state: 'Maharashtra', population: 34000, lat: 21.0500, lng: 75.7700, accessibility: 90.0 },
  { id: 58, name: 'Chalisgaon Rural', district: 'Jalgaon', state: 'Maharashtra', population: 28500, lat: 20.4600, lng: 75.0100, accessibility: 82.0 },
  { id: 59, name: 'Amalner Gram', district: 'Jalgaon', state: 'Maharashtra', population: 23000, lat: 21.0400, lng: 75.0600, accessibility: 77.0 },
  { id: 60, name: 'Chopda Satpura Foothills', district: 'Jalgaon', state: 'Maharashtra', population: 8900, lat: 21.2500, lng: 75.3000, accessibility: 53.0 },

  // --- 15. Jalna ---
  { id: 61, name: 'Partur Rural', district: 'Jalna', state: 'Maharashtra', population: 18000, lat: 19.5900, lng: 76.2100, accessibility: 75.0 },
  { id: 62, name: 'Ambad Gram', district: 'Jalna', state: 'Maharashtra', population: 14500, lat: 19.6100, lng: 75.7800, accessibility: 68.0 },
  { id: 63, name: 'Bhokardan Rural', district: 'Jalna', state: 'Maharashtra', population: 12200, lat: 20.2500, lng: 75.7700, accessibility: 60.0 },

  // --- 16. Kolhapur ---
  { id: 64, name: 'Radhanagari Wildlife Foothills', district: 'Kolhapur', state: 'Maharashtra', population: 6200, lat: 16.4100, lng: 73.9900, accessibility: 43.0 },
  { id: 65, name: 'Ichalkaranji Rural', district: 'Kolhapur', state: 'Maharashtra', population: 38000, lat: 16.7000, lng: 74.4600, accessibility: 92.0 },
  { id: 66, name: 'Gadhinglaj Rural', district: 'Kolhapur', state: 'Maharashtra', population: 21500, lat: 16.2300, lng: 74.3500, accessibility: 81.0 },
  { id: 67, name: 'Panhala Hill Village', district: 'Kolhapur', state: 'Maharashtra', population: 8400, lat: 16.8100, lng: 74.1100, accessibility: 67.0 },

  // --- 17. Latur ---
  { id: 68, name: 'Udgir Rural', district: 'Latur', state: 'Maharashtra', population: 26000, lat: 18.3900, lng: 77.1200, accessibility: 84.0 },
  { id: 69, name: 'Nilanga Gram', district: 'Latur', state: 'Maharashtra', population: 19200, lat: 18.1200, lng: 76.7600, accessibility: 74.0 },
  { id: 70, name: 'Ausa Historic Village', district: 'Latur', state: 'Maharashtra', population: 11500, lat: 18.2500, lng: 76.5000, accessibility: 63.0 },

  // --- 18. Mumbai City & Mumbai Suburban ---
  { id: 71, name: 'Gorai Fishing Village', district: 'Mumbai Suburban', state: 'Maharashtra', population: 7500, lat: 19.2300, lng: 72.7800, accessibility: 61.0 },
  { id: 72, name: 'Mankhurd Transit Cluster', district: 'Mumbai Suburban', state: 'Maharashtra', population: 42000, lat: 19.0600, lng: 72.9300, accessibility: 88.0 },
  { id: 73, name: 'Dharavi Coastal Periphery', district: 'Mumbai City', state: 'Maharashtra', population: 38000, lat: 19.0400, lng: 72.8550, accessibility: 91.0 },

  // --- 19. Nagpur ---
  { id: 74, name: 'Ramtek Rural', district: 'Nagpur', state: 'Maharashtra', population: 21000, lat: 21.4000, lng: 79.3300, accessibility: 83.0 },
  { id: 75, name: 'Katol Orange Belt Gram', district: 'Nagpur', state: 'Maharashtra', population: 24500, lat: 21.2700, lng: 78.5800, accessibility: 85.0 },
  { id: 76, name: 'Umred Mining Gram', district: 'Nagpur', state: 'Maharashtra', population: 18200, lat: 20.8500, lng: 79.3300, accessibility: 78.0 },
  { id: 77, name: 'Kuhi Tribal Border', district: 'Nagpur', state: 'Maharashtra', population: 4800, lat: 20.9800, lng: 79.3500, accessibility: 46.0 },

  // --- 20. Nanded ---
  { id: 78, name: 'Kinwat Tribal Belt', district: 'Nanded', state: 'Maharashtra', population: 7400, lat: 19.6300, lng: 78.2000, accessibility: 32.0 },
  { id: 79, name: 'Deglur Border Town', district: 'Nanded', state: 'Maharashtra', population: 22000, lat: 18.5500, lng: 77.5800, accessibility: 80.0 },
  { id: 80, name: 'Mukhed Rural', district: 'Nanded', state: 'Maharashtra', population: 15400, lat: 18.7200, lng: 77.3700, accessibility: 66.0 },

  // --- 21. Nandurbar (Satpura Tribal Region) ---
  { id: 81, name: 'Dhadgaon (Akrani Tribal)', district: 'Nandurbar', state: 'Maharashtra', population: 4200, lat: 21.6500, lng: 74.2200, accessibility: 16.0 },
  { id: 82, name: 'Molgi Hilly Hamlet', district: 'Nandurbar', state: 'Maharashtra', population: 2100, lat: 21.6800, lng: 74.0100, accessibility: 12.0 },
  { id: 83, name: 'Shahada Rural', district: 'Nandurbar', state: 'Maharashtra', population: 28000, lat: 21.5500, lng: 74.4700, accessibility: 82.0 },
  { id: 84, name: 'Navapur Forest Border', district: 'Nandurbar', state: 'Maharashtra', population: 13500, lat: 21.1700, lng: 73.8000, accessibility: 59.0 },

  // --- 22. Nashik ---
  { id: 85, name: 'Trimbakeshwar Rural', district: 'Nashik', state: 'Maharashtra', population: 16000, lat: 19.9300, lng: 73.5300, accessibility: 76.0 },
  { id: 86, name: 'Kalwan Tribal Center', district: 'Nashik', state: 'Maharashtra', population: 8800, lat: 20.4900, lng: 74.0200, accessibility: 44.0 },
  { id: 87, name: 'Surgana Remote Ghat', district: 'Nashik', state: 'Maharashtra', population: 3100, lat: 20.5700, lng: 73.6200, accessibility: 21.0 },
  { id: 88, name: 'Igatpuri Hill Village', district: 'Nashik', state: 'Maharashtra', population: 14200, lat: 19.6900, lng: 73.5600, accessibility: 71.0 },
  { id: 89, name: 'Malegaon Rural Belt', district: 'Nashik', state: 'Maharashtra', population: 39000, lat: 20.5500, lng: 74.5200, accessibility: 89.0 },

  // --- 23. Dharashiv (Osmanabad) ---
  { id: 90, name: 'Tuljapur Pilgrim Rural', district: 'Dharashiv', state: 'Maharashtra', population: 23500, lat: 18.0100, lng: 76.0700, accessibility: 83.0 },
  { id: 91, name: 'Omerga Border Gram', district: 'Dharashiv', state: 'Maharashtra', population: 17800, lat: 17.8400, lng: 76.6200, accessibility: 73.0 },
  { id: 92, name: 'Kallam Rural', district: 'Dharashiv', state: 'Maharashtra', population: 13200, lat: 18.5000, lng: 75.9500, accessibility: 65.0 },

  // --- 24. Palghar (Tribal Coastal & Forest) ---
  { id: 93, name: 'Jawhar Hill Station (Tribal)', district: 'Palghar', state: 'Maharashtra', population: 8900, lat: 19.9200, lng: 73.2300, accessibility: 37.0 },
  { id: 94, name: 'Mokhada Tribal Hamlet', district: 'Palghar', state: 'Maharashtra', population: 3400, lat: 19.9300, lng: 73.3400, accessibility: 22.0 },
  { id: 95, name: 'Dahanu Coastal Gram', district: 'Palghar', state: 'Maharashtra', population: 27000, lat: 19.9700, lng: 72.7300, accessibility: 84.0 },
  { id: 96, name: 'Wada Forest Taluka', district: 'Palghar', state: 'Maharashtra', population: 14500, lat: 19.6500, lng: 73.1400, accessibility: 63.0 },
  { id: 97, name: 'Talasari Border Tribal Area', district: 'Palghar', state: 'Maharashtra', population: 4600, lat: 20.1300, lng: 72.9200, accessibility: 35.0 },

  // --- 25. Parbhani ---
  { id: 98, name: 'Gangakhed Rural', district: 'Parbhani', state: 'Maharashtra', population: 21500, lat: 18.9500, lng: 76.7500, accessibility: 79.0 },
  { id: 99, name: 'Jintur Gram', district: 'Parbhani', state: 'Maharashtra', population: 16800, lat: 19.6100, lng: 76.6900, accessibility: 69.0 },
  { id: 100, name: 'Selu Rural', district: 'Parbhani', state: 'Maharashtra', population: 12900, lat: 19.4600, lng: 76.4400, accessibility: 64.0 },

  // --- 26. Raigad ---
  { id: 101, name: 'Mahad Rural', district: 'Raigad', state: 'Maharashtra', population: 25000, lat: 18.0800, lng: 73.4200, accessibility: 85.0 },
  { id: 102, name: 'Roha Gram', district: 'Raigad', state: 'Maharashtra', population: 18400, lat: 18.4300, lng: 73.1200, accessibility: 77.0 },
  { id: 103, name: 'Poladpur Ghat Village', district: 'Raigad', state: 'Maharashtra', population: 5200, lat: 17.9800, lng: 73.4600, accessibility: 40.0 },
  { id: 104, name: 'Mangaon Rural', district: 'Raigad', state: 'Maharashtra', population: 16000, lat: 18.2500, lng: 73.2800, accessibility: 74.0 },

  // --- 27. Ratnagiri ---
  { id: 105, name: 'Chiplun Rural', district: 'Ratnagiri', state: 'Maharashtra', population: 31000, lat: 17.5300, lng: 73.5100, accessibility: 88.0 },
  { id: 106, name: 'Dapoli Coastal Gram', district: 'Ratnagiri', state: 'Maharashtra', population: 15600, lat: 17.7600, lng: 73.1800, accessibility: 73.0 },
  { id: 107, name: 'Guhagar Beach Village', district: 'Ratnagiri', state: 'Maharashtra', population: 7800, lat: 17.4800, lng: 73.1900, accessibility: 55.0 },
  { id: 108, name: 'Rajapur Rural', district: 'Ratnagiri', state: 'Maharashtra', population: 9800, lat: 16.6600, lng: 73.5200, accessibility: 61.0 },

  // --- 28. Sangli ---
  { id: 109, name: 'Miraj Rural', district: 'Sangli', state: 'Maharashtra', population: 35000, lat: 16.8300, lng: 74.6400, accessibility: 91.0 },
  { id: 110, name: 'Tasgaon Grape Belt', district: 'Sangli', state: 'Maharashtra', population: 22000, lat: 17.0300, lng: 74.6000, accessibility: 82.0 },
  { id: 111, name: 'Jath Drought Belt (Remote)', district: 'Sangli', state: 'Maharashtra', population: 6800, lat: 17.0400, lng: 75.2200, accessibility: 39.0 },
  { id: 112, name: 'Shirala Hilly Village', district: 'Sangli', state: 'Maharashtra', population: 8400, lat: 16.9800, lng: 74.1300, accessibility: 56.0 },

  // --- 29. Satara ---
  { id: 113, name: 'Karad Rural', district: 'Satara', state: 'Maharashtra', population: 34000, lat: 17.2900, lng: 74.1800, accessibility: 92.0 },
  { id: 114, name: 'Wai Rural', district: 'Satara', state: 'Maharashtra', population: 18500, lat: 17.9500, lng: 73.8900, accessibility: 80.0 },
  { id: 115, name: 'Mahabaleshwar Rural Ghat', district: 'Satara', state: 'Maharashtra', population: 4900, lat: 17.9200, lng: 73.6600, accessibility: 46.0 },
  { id: 116, name: 'Patan Koyna Valley (Hilly)', district: 'Satara', state: 'Maharashtra', population: 3800, lat: 17.3700, lng: 73.9000, accessibility: 34.0 },

  // --- 30. Sindhudurg ---
  { id: 117, name: 'Sawantwadi Rural', district: 'Sindhudurg', state: 'Maharashtra', population: 21000, lat: 15.9100, lng: 73.8200, accessibility: 83.0 },
  { id: 118, name: 'Kankavli Gram', district: 'Sindhudurg', state: 'Maharashtra', population: 19500, lat: 16.2700, lng: 73.7100, accessibility: 81.0 },
  { id: 119, name: 'Malvan Coastal Village', district: 'Sindhudurg', state: 'Maharashtra', population: 11200, lat: 16.0600, lng: 73.4700, accessibility: 68.0 },
  { id: 120, name: 'Dodamarg Forest Hamlet', district: 'Sindhudurg', state: 'Maharashtra', population: 3600, lat: 15.7700, lng: 73.9800, accessibility: 38.0 },

  // --- 31. Solapur ---
  { id: 121, name: 'Pandharpur Rural', district: 'Solapur', state: 'Maharashtra', population: 38000, lat: 17.6800, lng: 75.3200, accessibility: 91.0 },
  { id: 122, name: 'Barshi Rural', district: 'Solapur', state: 'Maharashtra', population: 29000, lat: 18.2300, lng: 75.6900, accessibility: 86.0 },
  { id: 123, name: 'Akkalkot Border Gram', district: 'Solapur', state: 'Maharashtra', population: 16500, lat: 17.5200, lng: 76.2000, accessibility: 72.0 },
  { id: 124, name: 'Karmala Dry Belt Gram', district: 'Solapur', state: 'Maharashtra', population: 8900, lat: 18.4100, lng: 75.2000, accessibility: 51.0 },

  // --- 32. Thane ---
  { id: 125, name: 'Shahapur Rural Tribal Area', district: 'Thane', state: 'Maharashtra', population: 16800, lat: 19.4500, lng: 73.3300, accessibility: 67.0 },
  { id: 126, name: 'Murbad Gram', district: 'Thane', state: 'Maharashtra', population: 13500, lat: 19.2500, lng: 73.4000, accessibility: 66.0 },
  { id: 127, name: 'Bhiwandi Rural Periphery', district: 'Thane', state: 'Maharashtra', population: 31000, lat: 19.3000, lng: 73.0600, accessibility: 85.0 },

  // --- 33. Wardha ---
  { id: 128, name: 'Sevagram Rural Heritage', district: 'Wardha', state: 'Maharashtra', population: 14000, lat: 20.7200, lng: 78.6500, accessibility: 82.0 },
  { id: 129, name: 'Hinganghat Rural', district: 'Wardha', state: 'Maharashtra', population: 26000, lat: 20.5700, lng: 78.8400, accessibility: 84.0 },
  { id: 130, name: 'Arvi Cotton Belt Gram', district: 'Wardha', state: 'Maharashtra', population: 12500, lat: 20.9900, lng: 78.2300, accessibility: 68.0 },

  // --- 34. Washim ---
  { id: 131, name: 'Karanja Lad Rural', district: 'Washim', state: 'Maharashtra', population: 21000, lat: 20.4800, lng: 77.4900, accessibility: 78.0 },
  { id: 132, name: 'Risod Gram', district: 'Washim', state: 'Maharashtra', population: 15400, lat: 19.9700, lng: 76.7800, accessibility: 70.0 },
  { id: 133, name: 'Mangrulpir Rural', district: 'Washim', state: 'Maharashtra', population: 9800, lat: 20.3200, lng: 77.3400, accessibility: 59.0 },

  // --- 35. Yavatmal (Agrarian & Forest Belt) ---
  { id: 134, name: 'Pusad Rural', district: 'Yavatmal', state: 'Maharashtra', population: 28000, lat: 19.9100, lng: 77.5800, accessibility: 83.0 },
  { id: 135, name: 'Pandharkawada (Kelapur Tribal)', district: 'Yavatmal', state: 'Maharashtra', population: 9400, lat: 20.0200, lng: 78.5300, accessibility: 48.0 },
  { id: 136, name: 'Umarkhed Border Gram', district: 'Yavatmal', state: 'Maharashtra', population: 17500, lat: 19.6000, lng: 77.7000, accessibility: 71.0 },
  { id: 137, name: 'Ghatanji Tribal Valley', district: 'Yavatmal', state: 'Maharashtra', population: 4200, lat: 20.1400, lng: 78.3200, accessibility: 33.0 }
];

const maharashtraFacilities = [
  // --- 1. Pune District Facilities ---
  { id: 1, name: 'Shivapur Health Sub-Centre', type: 'Sub-Centre', address: 'Near Gram Panchayat, Shivapur', vid: 1, lat: 18.2860, lng: 73.8830, contact: '020-2438901', hours: '08:00 AM - 04:00 PM', status: 'Open', emer: 0, tot: 4, avail: 3 },
  { id: 2, name: 'Velhe Health Sub-Centre', type: 'Sub-Centre', address: 'Bajar Peth, Velhe Tehsil', vid: 4, lat: 18.2210, lng: 73.7915, contact: '02130-22109', hours: '08:00 AM - 04:00 PM', status: 'Open', emer: 0, tot: 3, avail: 1 },
  { id: 3, name: 'Ghoti Tribal Sub-Centre', type: 'Sub-Centre', address: 'Ghoti Khurd Foothills', vid: 8, lat: 18.2060, lng: 73.7310, contact: '02130-22580', hours: '09:00 AM - 03:00 PM', status: 'Open', emer: 0, tot: 2, avail: 2 },
  { id: 4, name: 'Khed Primary Health Centre', type: 'PHC', address: 'Station Road, Khed Gram', vid: 2, lat: 18.3215, lng: 73.9115, contact: '02135-222340', hours: '24 Hours', status: 'Open', emer: 1, tot: 15, avail: 8 },
  { id: 5, name: 'Saswad Primary Health Centre', type: 'PHC', address: 'Near Municipal Ground, Saswad', vid: 6, lat: 18.3465, lng: 74.0315, contact: '02115-222115', hours: '24 Hours', status: 'Open', emer: 1, tot: 16, avail: 7 },
  { id: 6, name: 'Narayangaon Primary Health Centre', type: 'PHC', address: 'NH-60 Bypass, Narayangaon', vid: 9, lat: 19.1215, lng: 73.9815, contact: '02132-242010', hours: '24 Hours', status: 'Open', emer: 1, tot: 14, avail: 6 },
  { id: 7, name: 'Manchar Community Health Centre', type: 'CHC', address: 'Pune-Nashik Highway, Manchar', vid: 3, lat: 18.3565, lng: 73.9465, contact: '02133-223450', hours: '24 Hours', status: 'Open', emer: 1, tot: 35, avail: 19 },
  { id: 8, name: 'Bhor Community Health Centre', type: 'CHC', address: 'Raja Raghunathrao Marg, Bhor', vid: 5, lat: 18.1520, lng: 73.8520, contact: '02113-222501', hours: '24 Hours', status: 'Open', emer: 1, tot: 30, avail: 14 },
  { id: 9, name: 'Shirur Community Health Centre', type: 'CHC', address: 'Ghodnadi Road, Shirur', vid: 12, lat: 18.8270, lng: 74.3770, contact: '02137-252110', hours: '24 Hours', status: 'Open', emer: 1, tot: 40, avail: 22 },
  { id: 10, name: 'Junnar Sub-District Hospital', type: 'Sub-District Hospital', address: 'Shivaji Chowk, Junnar', vid: 10, lat: 19.2095, lng: 73.8775, contact: '02132-222045', hours: '24 Hours', status: 'Open', emer: 1, tot: 60, avail: 28 },
  { id: 11, name: 'Baramati Sub-District Hospital', type: 'Sub-District Hospital', address: 'MIDC Road, Baramati Rural', vid: 11, lat: 18.1570, lng: 74.5820, contact: '02112-243500', hours: '24 Hours', status: 'Open', emer: 1, tot: 75, avail: 34 },
  { id: 12, name: 'Pune District Hospital (Aundh)', type: 'Government Hospital', address: 'Chest Hospital Campus, Aundh, Pune', vid: 2, lat: 18.5780, lng: 73.8080, contact: '020-27280450', hours: '24 Hours', status: 'Open', emer: 1, tot: 150, avail: 42 },

  // --- 2. Ahmednagar (Ahilyanagar) ---
  { id: 13, name: 'Ahmednagar District Civil Hospital', type: 'Government Hospital', address: 'Court Road, Ahmednagar City', vid: 13, lat: 19.0950, lng: 74.7420, contact: '0241-2430501', hours: '24 Hours', status: 'Open', emer: 1, tot: 250, avail: 68 },
  { id: 14, name: 'Sangamner Sub-District Hospital', type: 'Sub-District Hospital', address: 'Akole Road, Sangamner', vid: 15, lat: 19.5780, lng: 74.2150, contact: '02425-223400', hours: '24 Hours', status: 'Open', emer: 1, tot: 100, avail: 38 },
  { id: 15, name: 'Shirdi Rural Hospital & CHC', type: 'CHC', address: 'Temple Ring Road, Shirdi', vid: 14, lat: 19.7670, lng: 74.4780, contact: '02423-258000', hours: '24 Hours', status: 'Open', emer: 1, tot: 60, avail: 25 },
  { id: 16, name: 'Akole Tribal Primary Health Centre', type: 'PHC', address: 'Bhandardara Road, Akole', vid: 16, lat: 19.5430, lng: 73.9370, contact: '02424-221220', hours: '24 Hours', status: 'Open', emer: 1, tot: 16, avail: 6 },

  // --- 3. Akola ---
  { id: 17, name: 'Akola GMC & District General Hospital', type: 'Government Hospital', address: 'Collectorate Road, Akola', vid: 17, lat: 20.7040, lng: 77.0080, contact: '0724-2431960', hours: '24 Hours', status: 'Open', emer: 1, tot: 300, avail: 84 },
  { id: 18, name: 'Murtizapur Sub-District Hospital', type: 'Sub-District Hospital', address: 'Station Road, Murtizapur', vid: 17, lat: 20.7340, lng: 77.3650, contact: '07256-241250', hours: '24 Hours', status: 'Open', emer: 1, tot: 50, avail: 20 },
  { id: 19, name: 'Balapur Primary Health Centre', type: 'PHC', address: 'Fort Gate Road, Balapur', vid: 18, lat: 20.6680, lng: 76.7740, contact: '07257-222100', hours: '24 Hours', status: 'Open', emer: 1, tot: 12, avail: 5 },

  // --- 4. Amravati ---
  { id: 20, name: 'Amravati District General Hospital (Irwin)', type: 'Government Hospital', address: 'Irwin Chowk, Amravati', vid: 22, lat: 20.9320, lng: 77.7520, contact: '0721-2662800', hours: '24 Hours', status: 'Open', emer: 1, tot: 400, avail: 112 },
  { id: 21, name: 'Dharni Sub-District Tribal Hospital (Melghat)', type: 'Sub-District Hospital', address: 'Main Road, Dharni Tehsil', vid: 20, lat: 21.5220, lng: 77.0010, contact: '07226-224210', hours: '24 Hours', status: 'Open', emer: 1, tot: 60, avail: 22 },
  { id: 22, name: 'Achalpur Sub-District Hospital', type: 'Sub-District Hospital', address: 'Civil Lines, Achalpur', vid: 22, lat: 21.2600, lng: 77.5120, contact: '07223-222140', hours: '24 Hours', status: 'Open', emer: 1, tot: 75, avail: 31 },

  // --- 5. Chhatrapati Sambhajinagar (Aurangabad) ---
  { id: 23, name: 'Chhatrapati Sambhajinagar Civil Hospital', type: 'Government Hospital', address: 'Khokadpura, Sambhajinagar', vid: 24, lat: 19.8800, lng: 75.3280, contact: '0240-2331125', hours: '24 Hours', status: 'Open', emer: 1, tot: 450, avail: 135 },
  { id: 24, name: 'Paithan Sub-District Hospital', type: 'Sub-District Hospital', address: 'Godavari Ring Road, Paithan', vid: 24, lat: 19.4820, lng: 75.3820, contact: '02431-223050', hours: '24 Hours', status: 'Open', emer: 1, tot: 60, avail: 26 },
  { id: 25, name: 'Vaijapur Rural Hospital & CHC', type: 'CHC', address: 'Station Road, Vaijapur', vid: 25, lat: 19.9220, lng: 74.7330, contact: '02436-222040', hours: '24 Hours', status: 'Open', emer: 1, tot: 40, avail: 18 },

  // --- 6. Beed ---
  { id: 26, name: 'Beed District Civil Hospital', type: 'Government Hospital', address: 'Jalna Road, Beed', vid: 28, lat: 18.9900, lng: 75.7550, contact: '02442-222380', hours: '24 Hours', status: 'Open', emer: 1, tot: 250, avail: 72 },
  { id: 27, name: 'Parli Sub-District Hospital', type: 'Sub-District Hospital', address: 'Railway Station Road, Parli', vid: 29, lat: 18.8520, lng: 76.5330, contact: '02446-222400', hours: '24 Hours', status: 'Open', emer: 1, tot: 80, avail: 35 },
  { id: 28, name: 'Georai Primary Health Centre', type: 'PHC', address: 'Khadki Gate, Georai', vid: 28, lat: 19.2620, lng: 75.7520, contact: '02447-262110', hours: '24 Hours', status: 'Open', emer: 1, tot: 16, avail: 7 },

  // --- 7. Bhandara ---
  { id: 29, name: 'Bhandara District General Hospital', type: 'Government Hospital', address: 'Civil Lines, Bhandara', vid: 32, lat: 21.1720, lng: 79.6520, contact: '07184-252445', hours: '24 Hours', status: 'Open', emer: 1, tot: 200, avail: 58 },
  { id: 30, name: 'Tumsar Sub-District Hospital', type: 'Sub-District Hospital', address: 'Bawanthadi Road, Tumsar', vid: 32, lat: 21.3820, lng: 79.7420, contact: '07183-232120', hours: '24 Hours', status: 'Open', emer: 1, tot: 50, avail: 21 },

  // --- 8. Buldhana ---
  { id: 31, name: 'Buldhana District Hospital', type: 'Government Hospital', address: 'Chikhli Road, Buldhana', vid: 35, lat: 20.5320, lng: 76.1830, contact: '07262-242200', hours: '24 Hours', status: 'Open', emer: 1, tot: 200, avail: 60 },
  { id: 32, name: 'Khamgaon General Hospital', type: 'Sub-District Hospital', address: 'National Highway 6, Khamgaon', vid: 35, lat: 20.6820, lng: 76.5730, contact: '07263-252180', hours: '24 Hours', status: 'Open', emer: 1, tot: 100, avail: 42 },

  // --- 9. Chandrapur ---
  { id: 33, name: 'Chandrapur GMC & District Hospital', type: 'Government Hospital', address: 'Ramnagar, Chandrapur', vid: 40, lat: 19.9550, lng: 79.2980, contact: '07172-252320', hours: '24 Hours', status: 'Open', emer: 1, tot: 350, avail: 95 },
  { id: 34, name: 'Warora Sub-District Hospital', type: 'Sub-District Hospital', address: 'Anandwan Road, Warora', vid: 39, lat: 20.2320, lng: 79.0030, contact: '07176-282100', hours: '24 Hours', status: 'Open', emer: 1, tot: 60, avail: 24 },

  // --- 10. Dhule ---
  { id: 35, name: 'Dhule Government Hospital & Medical College', type: 'Government Hospital', address: 'Chakkarbardi, Dhule', vid: 43, lat: 20.9040, lng: 74.7780, contact: '02562-237060', hours: '24 Hours', status: 'Open', emer: 1, tot: 300, avail: 88 },
  { id: 36, name: 'Shirpur Sub-District Hospital', type: 'Sub-District Hospital', address: 'Karwand Road, Shirpur', vid: 43, lat: 21.3520, lng: 74.8820, contact: '02563-255150', hours: '24 Hours', status: 'Open', emer: 1, tot: 75, avail: 32 },

  // --- 11. Gadchiroli (Tribal Critical Region) ---
  { id: 37, name: 'Gadchiroli District General Hospital', type: 'Government Hospital', address: 'Complex Area, Gadchiroli', vid: 48, lat: 20.1840, lng: 80.0020, contact: '07132-222040', hours: '24 Hours', status: 'Open', emer: 1, tot: 200, avail: 54 },
  { id: 38, name: 'Aheri Sub-District Tribal Hospital', type: 'Sub-District Hospital', address: 'Allapalli Road, Aheri', vid: 46, lat: 19.4120, lng: 80.0030, contact: '07133-272100', hours: '24 Hours', status: 'Open', emer: 1, tot: 60, avail: 18 },
  { id: 39, name: 'Kurkheda Community Health Centre', type: 'CHC', address: 'Armori Road, Kurkheda', vid: 48, lat: 20.5820, lng: 80.2020, contact: '07137-262220', hours: '24 Hours', status: 'Open', emer: 1, tot: 30, avail: 12 },
  { id: 40, name: 'Bhamragad Tribal Health Post', type: 'Sub-Centre', address: 'Triveni Sangam Road, Bhamragad', vid: 50, lat: 19.2520, lng: 80.3720, contact: '07133-288100', hours: '08:00 AM - 04:00 PM', status: 'Open', emer: 0, tot: 6, avail: 3 },

  // --- 12. Gondia ---
  { id: 41, name: 'Gondia GMC & General Hospital', type: 'Government Hospital', address: 'Kudwa Naka, Gondia', vid: 51, lat: 21.4620, lng: 80.2020, contact: '07182-238090', hours: '24 Hours', status: 'Open', emer: 1, tot: 300, avail: 90 },
  { id: 42, name: 'Deori Rural Hospital & CHC', type: 'CHC', address: 'NH-6 Bypass, Deori', vid: 52, lat: 21.0820, lng: 80.3620, contact: '07199-225100', hours: '24 Hours', status: 'Open', emer: 1, tot: 30, avail: 14 },

  // --- 13. Hingoli ---
  { id: 43, name: 'Hingoli District Civil Hospital', type: 'Government Hospital', address: 'Akola Naka, Hingoli', vid: 54, lat: 19.7220, lng: 77.1520, contact: '02456-221650', hours: '24 Hours', status: 'Open', emer: 1, tot: 150, avail: 48 },
  { id: 44, name: 'Basmath Sub-District Hospital', type: 'Sub-District Hospital', address: 'Hatta Road, Basmath', vid: 54, lat: 19.5120, lng: 77.1620, contact: '02454-220120', hours: '24 Hours', status: 'Open', emer: 1, tot: 50, avail: 22 },

  // --- 14. Jalgaon ---
  { id: 45, name: 'Jalgaon GMC & Civil Hospital', type: 'Government Hospital', address: 'Station Road, Jalgaon', vid: 57, lat: 21.0060, lng: 75.5640, contact: '0257-2223800', hours: '24 Hours', status: 'Open', emer: 1, tot: 350, avail: 98 },
  { id: 46, name: 'Chalisgaon Sub-District Hospital', type: 'Sub-District Hospital', address: 'Bhadgaon Road, Chalisgaon', vid: 58, lat: 20.4630, lng: 75.0130, contact: '02589-222140', hours: '24 Hours', status: 'Open', emer: 1, tot: 80, avail: 36 },

  // --- 15. Jalna ---
  { id: 47, name: 'Jalna District Civil Hospital', type: 'Government Hospital', address: 'Devalgaon Raja Road, Jalna', vid: 61, lat: 19.8420, lng: 75.8830, contact: '02482-224480', hours: '24 Hours', status: 'Open', emer: 1, tot: 200, avail: 65 },
  { id: 48, name: 'Partur Sub-District Hospital', type: 'Sub-District Hospital', address: 'Mantha Road, Partur', vid: 61, lat: 19.5920, lng: 76.2130, contact: '02484-221100', hours: '24 Hours', status: 'Open', emer: 1, tot: 50, avail: 19 },

  // --- 16. Kolhapur ---
  { id: 49, name: 'Kolhapur CPR District Civil Hospital', type: 'Government Hospital', address: 'Dasara Chowk, Kolhapur', vid: 65, lat: 16.7020, lng: 74.2380, contact: '0231-2641011', hours: '24 Hours', status: 'Open', emer: 1, tot: 450, avail: 120 },
  { id: 50, name: 'Gadhinglaj Sub-District Hospital', type: 'Sub-District Hospital', address: 'Sankeshwar Road, Gadhinglaj', vid: 66, lat: 16.2320, lng: 74.3530, contact: '02327-222300', hours: '24 Hours', status: 'Open', emer: 1, tot: 75, avail: 30 },
  { id: 51, name: 'Radhanagari Primary Health Centre', type: 'PHC', address: 'Dhamani Road, Radhanagari', vid: 64, lat: 16.4120, lng: 73.9920, contact: '02321-234120', hours: '24 Hours', status: 'Open', emer: 1, tot: 14, avail: 6 },

  // --- 17. Latur ---
  { id: 52, name: 'Latur GMC & Vilasrao Deshmukh Hospital', type: 'Government Hospital', address: 'Ring Road, Latur', vid: 68, lat: 18.4050, lng: 76.5820, contact: '02382-249292', hours: '24 Hours', status: 'Open', emer: 1, tot: 400, avail: 110 },
  { id: 53, name: 'Udgir Sub-District Hospital', type: 'Sub-District Hospital', address: 'Nanded Road, Udgir', vid: 68, lat: 18.3920, lng: 77.1220, contact: '02385-256150', hours: '24 Hours', status: 'Open', emer: 1, tot: 80, avail: 32 },

  // --- 18. Mumbai City & Mumbai Suburban ---
  { id: 54, name: 'KEM Hospital & Medical College', type: 'Government Hospital', address: 'Acharya Donde Marg, Parel, Mumbai', vid: 73, lat: 18.9980, lng: 72.8420, contact: '022-24107000', hours: '24 Hours', status: 'Open', emer: 1, tot: 600, avail: 145 },
  { id: 55, name: 'Rajawadi Municipal General Hospital', type: 'Government Hospital', address: 'Ghatkopar East, Mumbai Suburban', vid: 72, lat: 19.0780, lng: 72.9080, contact: '022-25115066', hours: '24 Hours', status: 'Open', emer: 1, tot: 350, avail: 78 },

  // --- 19. Nagpur ---
  { id: 56, name: 'Nagpur Government Medical College & Hospital', type: 'Government Hospital', address: 'Medical Square, Hanuman Nagar, Nagpur', vid: 74, lat: 21.1370, lng: 79.0960, contact: '0712-2744671', hours: '24 Hours', status: 'Open', emer: 1, tot: 550, avail: 160 },
  { id: 57, name: 'Ramtek Sub-District Hospital', type: 'Sub-District Hospital', address: 'Mansar Road, Ramtek', vid: 74, lat: 21.4020, lng: 79.3320, contact: '07114-255140', hours: '24 Hours', status: 'Open', emer: 1, tot: 60, avail: 25 },
  { id: 58, name: 'Katol Rural Hospital & CHC', type: 'CHC', address: 'Nagpur Road, Katol', vid: 75, lat: 21.2720, lng: 78.5830, contact: '07112-222120', hours: '24 Hours', status: 'Open', emer: 1, tot: 40, avail: 19 },

  // --- 20. Nanded ---
  { id: 59, name: 'Dr. Shankarrao Chavan GMC Hospital Nanded', type: 'Government Hospital', address: 'Vazirabad, Nanded', vid: 79, lat: 19.1580, lng: 77.3150, contact: '02462-234050', hours: '24 Hours', status: 'Open', emer: 1, tot: 380, avail: 105 },
  { id: 60, name: 'Kinwat Sub-District Tribal Hospital', type: 'Sub-District Hospital', address: 'Mahur Road, Kinwat', vid: 78, lat: 19.6320, lng: 78.2020, contact: '02469-222110', hours: '24 Hours', status: 'Open', emer: 1, tot: 60, avail: 21 },

  // --- 21. Nandurbar (Tribal Hills) ---
  { id: 61, name: 'Nandurbar District Civil Hospital', type: 'Government Hospital', address: 'Sakri Naka, Nandurbar', vid: 83, lat: 21.3740, lng: 74.2420, contact: '02564-222250', hours: '24 Hours', status: 'Open', emer: 1, tot: 220, avail: 68 },
  { id: 62, name: 'Dhadgaon Sub-District Tribal Hospital (Akrani)', type: 'Sub-District Hospital', address: 'Toranmal Road, Dhadgaon', vid: 81, lat: 21.6520, lng: 74.2230, contact: '02568-242200', hours: '24 Hours', status: 'Open', emer: 1, tot: 50, avail: 15 },
  { id: 63, name: 'Shahada Rural Hospital & CHC', type: 'CHC', address: 'Prakasha Road, Shahada', vid: 83, lat: 21.5530, lng: 74.4730, contact: '02565-223120', hours: '24 Hours', status: 'Open', emer: 1, tot: 40, avail: 17 },

  // --- 22. Nashik ---
  { id: 64, name: 'Nashik District Civil Hospital', type: 'Government Hospital', address: 'Trimbak Naka, Nashik City', vid: 85, lat: 20.0050, lng: 73.7900, contact: '0253-2572110', hours: '24 Hours', status: 'Open', emer: 1, tot: 450, avail: 130 },
  { id: 65, name: 'Malegaon General Hospital', type: 'Government Hospital', address: 'Camp Area, Malegaon', vid: 89, lat: 20.5530, lng: 74.5240, contact: '02554-250100', hours: '24 Hours', status: 'Open', emer: 1, tot: 200, avail: 62 },
  { id: 66, name: 'Kalwan Sub-District Tribal Hospital', type: 'Sub-District Hospital', address: 'Abhona Road, Kalwan', vid: 86, lat: 20.4920, lng: 74.0230, contact: '02592-222210', hours: '24 Hours', status: 'Open', emer: 1, tot: 60, avail: 24 },

  // --- 23. Dharashiv (Osmanabad) ---
  { id: 67, name: 'Dharashiv District Civil Hospital', type: 'Government Hospital', address: 'Solapur Road, Dharashiv', vid: 90, lat: 18.1820, lng: 76.0430, contact: '02472-222340', hours: '24 Hours', status: 'Open', emer: 1, tot: 200, avail: 65 },
  { id: 68, name: 'Tuljapur Sub-District Hospital', type: 'Sub-District Hospital', address: 'Ghat Road, Tuljapur', vid: 90, lat: 18.0130, lng: 76.0730, contact: '02471-242050', hours: '24 Hours', status: 'Open', emer: 1, tot: 60, avail: 28 },

  // --- 24. Palghar (Tribal Coastal & Forest) ---
  { id: 69, name: 'Palghar District Hospital', type: 'Government Hospital', address: 'Kacheri Road, Palghar', vid: 95, lat: 19.7020, lng: 72.7720, contact: '02525-252110', hours: '24 Hours', status: 'Open', emer: 1, tot: 200, avail: 58 },
  { id: 70, name: 'Jawhar Sub-District Cottage Hospital', type: 'Sub-District Hospital', address: 'Silvassa Road, Jawhar', vid: 93, lat: 19.9220, lng: 73.2320, contact: '02520-222320', hours: '24 Hours', status: 'Open', emer: 1, tot: 80, avail: 27 },
  { id: 71, name: 'Dahanu Sub-District Hospital', type: 'Sub-District Hospital', address: 'Sea Face Road, Dahanu', vid: 95, lat: 19.9720, lng: 72.7330, contact: '02528-222120', hours: '24 Hours', status: 'Open', emer: 1, tot: 60, avail: 24 },
  { id: 72, name: 'Mokhada Tribal Primary Health Centre', type: 'PHC', address: 'Kasara Road, Mokhada', vid: 94, lat: 19.9320, lng: 73.3420, contact: '02529-255100', hours: '24 Hours', status: 'Open', emer: 1, tot: 16, avail: 5 },

  // --- 25. Parbhani ---
  { id: 73, name: 'Parbhani District Civil Hospital', type: 'Government Hospital', address: 'Subhash Road, Parbhani', vid: 98, lat: 19.2720, lng: 76.7740, contact: '02452-223450', hours: '24 Hours', status: 'Open', emer: 1, tot: 250, avail: 75 },
  { id: 74, name: 'Gangakhed Sub-District Hospital', type: 'Sub-District Hospital', address: 'Parli Road, Gangakhed', vid: 98, lat: 18.9530, lng: 76.7530, contact: '02453-222120', hours: '24 Hours', status: 'Open', emer: 1, tot: 60, avail: 26 },

  // --- 26. Raigad ---
  { id: 75, name: 'Alibag District Civil Hospital', type: 'Government Hospital', address: 'Varsoli Road, Alibag', vid: 102, lat: 18.6420, lng: 72.8720, contact: '02141-222540', hours: '24 Hours', status: 'Open', emer: 1, tot: 200, avail: 64 },
  { id: 76, name: 'Mahad Sub-District Trauma Hospital', type: 'Sub-District Hospital', address: 'Mumbai-Goa Highway, Mahad', vid: 101, lat: 18.0830, lng: 73.4230, contact: '02145-222140', hours: '24 Hours', status: 'Open', emer: 1, tot: 75, avail: 30 },

  // --- 27. Ratnagiri ---
  { id: 77, name: 'Ratnagiri District Civil Hospital', type: 'Government Hospital', address: 'Jail Road, Ratnagiri', vid: 105, lat: 16.9940, lng: 73.3120, contact: '02352-222370', hours: '24 Hours', status: 'Open', emer: 1, tot: 220, avail: 70 },
  { id: 78, name: 'Chiplun Sub-District Hospital', type: 'Sub-District Hospital', address: 'Bahadur Shaikh Naka, Chiplun', vid: 105, lat: 17.5330, lng: 73.5130, contact: '02355-252150', hours: '24 Hours', status: 'Open', emer: 1, tot: 80, avail: 34 },

  // --- 28. Sangli ---
  { id: 79, name: 'Sangli GMC & Civil Hospital', type: 'Government Hospital', address: 'Civil Hospital Chowk, Sangli', vid: 109, lat: 16.8560, lng: 74.5840, contact: '0233-2374650', hours: '24 Hours', status: 'Open', emer: 1, tot: 380, avail: 115 },
  { id: 80, name: 'Jath Sub-District Hospital', type: 'Sub-District Hospital', address: 'Bijapur Road, Jath', vid: 111, lat: 17.0430, lng: 75.2230, contact: '02344-246100', hours: '24 Hours', status: 'Open', emer: 1, tot: 60, avail: 22 },

  // --- 29. Satara ---
  { id: 81, name: 'Satara District Civil Hospital (KNP)', type: 'Government Hospital', address: 'Sadar Bazar, Satara', vid: 113, lat: 17.6860, lng: 74.0040, contact: '02162-234280', hours: '24 Hours', status: 'Open', emer: 1, tot: 320, avail: 92 },
  { id: 82, name: 'Karad Sub-District Hospital', type: 'Sub-District Hospital', address: 'Malkapur Road, Karad', vid: 113, lat: 17.2930, lng: 74.1830, contact: '02164-222140', hours: '24 Hours', status: 'Open', emer: 1, tot: 100, avail: 40 },

  // --- 30. Sindhudurg ---
  { id: 83, name: 'Sindhudurg District Civil Hospital (Oros)', type: 'Government Hospital', address: 'Sindhudurgnagari, Oros', vid: 118, lat: 16.1230, lng: 73.7050, contact: '02362-228900', hours: '24 Hours', status: 'Open', emer: 1, tot: 180, avail: 60 },
  { id: 84, name: 'Sawantwadi Sub-District Hospital', type: 'Sub-District Hospital', address: 'Moti Talav Road, Sawantwadi', vid: 117, lat: 15.9130, lng: 73.8230, contact: '02363-272040', hours: '24 Hours', status: 'Open', emer: 1, tot: 70, avail: 28 },

  // --- 31. Solapur ---
  { id: 85, name: 'Solapur CSM General Hospital & GMC', type: 'Government Hospital', address: 'Railway Lines, Solapur', vid: 121, lat: 17.6680, lng: 75.9080, contact: '0217-2749400', hours: '24 Hours', status: 'Open', emer: 1, tot: 500, avail: 140 },
  { id: 86, name: 'Pandharpur Sub-District Hospital', type: 'Sub-District Hospital', address: 'Link Road, Pandharpur', vid: 121, lat: 17.6830, lng: 75.3240, contact: '02186-223400', hours: '24 Hours', status: 'Open', emer: 1, tot: 100, avail: 42 },

  // --- 32. Thane ---
  { id: 87, name: 'Thane District Civil Hospital', type: 'Government Hospital', address: 'Tembhi Naka, Thane West', vid: 127, lat: 19.2020, lng: 72.9780, contact: '022-25472580', hours: '24 Hours', status: 'Open', emer: 1, tot: 350, avail: 92 },
  { id: 88, name: 'Shahapur Sub-District Hospital', type: 'Sub-District Hospital', address: 'Agra Road, Shahapur', vid: 125, lat: 19.4530, lng: 73.3330, contact: '02527-272050', hours: '24 Hours', status: 'Open', emer: 1, tot: 60, avail: 25 },

  // --- 33. Wardha ---
  { id: 89, name: 'Wardha District General Hospital', type: 'Government Hospital', address: 'Bachelor Road, Wardha', vid: 128, lat: 20.7450, lng: 78.6020, contact: '07152-243560', hours: '24 Hours', status: 'Open', emer: 1, tot: 250, avail: 78 },
  { id: 90, name: 'Kasturba Rural Hospital Sevagram', type: 'Government Hospital', address: 'Sevagram Ashram Road, Wardha', vid: 128, lat: 20.7230, lng: 78.6530, contact: '07152-284341', hours: '24 Hours', status: 'Open', emer: 1, tot: 200, avail: 65 },

  // --- 34. Washim ---
  { id: 91, name: 'Washim District Civil Hospital', type: 'Government Hospital', address: 'Pusad Naka, Washim', vid: 131, lat: 20.1140, lng: 77.1350, contact: '07252-232140', hours: '24 Hours', status: 'Open', emer: 1, tot: 180, avail: 55 },
  { id: 92, name: 'Karanja Lad Sub-District Hospital', type: 'Sub-District Hospital', address: 'Civil Hospital Road, Karanja', vid: 131, lat: 20.4830, lng: 77.4930, contact: '07256-222300', hours: '24 Hours', status: 'Open', emer: 1, tot: 50, avail: 20 },

  // --- 35. Yavatmal ---
  { id: 93, name: 'Shri Vasantrao Naik GMC Hospital Yavatmal', type: 'Government Hospital', address: 'Civil Lines, Yavatmal', vid: 134, lat: 20.3940, lng: 78.1250, contact: '07232-242456', hours: '24 Hours', status: 'Open', emer: 1, tot: 420, avail: 118 },
  { id: 94, name: 'Pusad Sub-District Hospital', type: 'Sub-District Hospital', address: 'Washim Road, Pusad', vid: 134, lat: 19.9130, lng: 77.5830, contact: '07233-246220', hours: '24 Hours', status: 'Open', emer: 1, tot: 80, avail: 31 },
  { id: 95, name: 'Pandharkawada Rural Hospital', type: 'CHC', address: 'Kelapur Highway, Pandharkawada', vid: 135, lat: 20.0230, lng: 78.5330, contact: '07235-227140', hours: '24 Hours', status: 'Open', emer: 1, tot: 30, avail: 14 }
];

module.exports = {
  maharashtraVillages,
  maharashtraFacilities
};
