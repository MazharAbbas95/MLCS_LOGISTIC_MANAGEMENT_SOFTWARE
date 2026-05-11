import React from 'react';
import './BiltyHeader.css';

interface BiltyHeaderProps {
   companyName?: string;
   urduCompanyName?: string;
   ownerName?: string;
   phonesLeft?: string[];
   phonesRight?: string[];
   addressLeft?: string;
   addressRight?: string;
   ntn?: string;
}

const BiltyHeader: React.FC<BiltyHeaderProps> = ({
   companyName,
   urduCompanyName,
   ownerName,
   phonesLeft,
   phonesRight,
   addressLeft,
   addressRight,
   ntn
}) => {
   return (
      <div className="bilty-header-container bg-white">
         {/* Background Layered Decorative Shapes */}
         <div className="header-bg-curves">
            <div className="curve-shape curve-1"></div>
            <div className="curve-shape curve-2"></div>
            <div className="curve-shape curve-center"></div>
         </div>

         <div className="relative z-10 px-4 pt-2">
            {/* TOP BRANDING ROW */}
            <div className="flex justify-between items-end mb-4">
               <div className="flex flex-col">
                  <div className="branding-english uppercase">{companyName || 'Madad Logistics Container'}</div>
                  <div className="sub-title-services uppercase ml-auto -mt-2 pr-4">Services</div>
               </div>

               <div className="urdu-text branding-urdu-main text-right pr-4 mt-10">
                  <span className="urdu-red">{urduCompanyName ? urduCompanyName.split(' ')[0] : 'مدد'}</span> <span className="urdu-blue">{urduCompanyName ? urduCompanyName.split(' ').slice(1).join(' ') : 'لاجسٹکس کنٹینرز سروسز'}</span>
                  <span className="text-[14px] urdu-red ml-1">(رجسٹرڈ)</span>
               </div>
            </div>

            {/* MIDDLE INFORMATION GRID */}
            <div className="flex justify-between items-start gap-2">
               {/* Column 1: Main Phones */}
               <div className="flex flex-col text-[11px] font-black text-blue-900 leading-normal border-r border-gray-200 pr-4 space-y-1">
                  {(phonesLeft || ['0300-8632436', '0300-8633436', '0300-8617436', '0302-6077364', '0306-7154581']).map((phone, i) => (
                     <span key={i}>{phone}</span>
                  ))}
               </div>

               {/* Column 2: Malik Kamran & Sufiyan Awan */}
               <div className="flex flex-col gap-4">
                  <div className="flex flex-col mb-1">
                     <div className="flex items-center gap-2 mb-1.5">
                        <span className="urdu-text text-[12px] font-black text-red-600">ملک کامران اعوان</span>
                        <div className="office-badge urdu-text shadow-sm">ملتان آفس</div>
                     </div>
                     <div className="flex flex-col text-[10px] font-black text-blue-900 space-y-1 ml-1">
                        <span>0300-8629436</span>
                        <span>0301-2066565</span>
                     </div>
                  </div>

                  <div className="flex flex-col">
                     <div className="flex items-center gap-2 mb-1.5">
                        <span className="urdu-text text-[12px] font-black text-red-600">ملک سفیان اعوان</span>
                        <div className="office-badge urdu-text shadow-sm">کراچی آفس</div>
                     </div>
                     <div className="flex flex-col text-[10px] font-black text-blue-900 ml-1">
                        <span>0321-8619436</span>
                     </div>
                  </div>
               </div>

               {/* Column 3: Logo & Truck Central Area */}
               <div className="flex flex-col items-center justify-center -mt-4 z-10 mr-12 xl:mr-40">
                  {/* Logo Area */}
                  <div className="relative w-25 h-25 sm:w-25 sm:h-25 flex items-center justify-center z-10">
                     <img src="/mlcs_logo.png" alt="MLCS Logo" className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  {/* Truck Image */}
                  <div className="relative w-30 h-20 sm:w-30 sm:h-20 flex items-center justify-center -mt-6">
                     <img src="/truck.png" alt="Truck" className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
               </div>

               {/* Column 4: Owner Info */}
               <div className="flex flex-col items-end text-right border-l border-gray-200 pl-4 pr-2 sm:pr-4 mt-5 mr-16">
                  <div className="flex items-center gap-2 mb-3">
                     <span className="urdu-text text-[18px] font-black text-[#dc2626]">{ownerName || 'مدد خان اعوان'}</span>
                     <span className="proprietor-badge urdu-text shadow-sm">پروپرائٹر</span>
                  </div>
                  <div className="flex flex-col text-[12px] font-black text-[#1e3a8a] space-y-1">
                     {(phonesRight || ['0306-8637436', '0300-5637436']).map((phone, i) => (
                        <span key={i}>{phone}</span>
                     ))}
                  </div>
                  <div className="mt-4 w-12 h-1 bg-[#dc2626] rounded-full opacity-80"></div>
               </div>
            </div>

            {/* BOTTOM ADDRESS SECTION */}
            <div className="mt-4 bg-[#283593] flex items-center justify-between text-white border-t-2 border-[#1a237e] relative overflow-hidden">
               <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>

               <div className="urdu-text text-[10px] font-bold py-2 px-6 flex-1 text-center border-r border-white/20 leading-tight">
                  {addressLeft || 'گیٹ نمبر 3 گلی نمبر 4 روم نمبر 3 پلاٹ نمبر A-668 نیو کہ قائد اعظم ہاکس بے روڈ کراچی'}
               </div>

               <div className="px-4 relative z-10">
                  <div className="bg-white text-[#e91e63] px-4 py-0.5 rounded-sm font-black text-[12px] shadow-md border border-white whitespace-nowrap">
                     NTN # {ntn || 'C727312-4'}
                  </div>
               </div>

               <div className="urdu-text text-[10px] font-bold py-2 px-6 flex-1 text-center border-l border-white/20 leading-tight">
                  {addressRight || 'ناگ شاہ چوک مظفر گڑھ روڈ نزد NHA آفس ملتان'}
               </div>
            </div>
         </div>
      </div>
   );
};

export default BiltyHeader;
