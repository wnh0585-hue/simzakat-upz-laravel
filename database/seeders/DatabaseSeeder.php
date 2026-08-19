<?php

namespace Database\Seeders;

use App\Models\{User, Muzakki, Mustahik, Program, CollectionPlan, BankAccount, AppSetting, Transaction};
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Users
        User::firstOrCreate(['email' => 'admin@kemenag.go.id'], [
            'name' => 'Administrator', 'password' => Hash::make('admin123'),
            'role' => 'Admin', 'active' => true, 'nip' => '197001012000011001', 'unit_kerja' => 'Kankemenag Kab. Kebumen',
        ]);
        User::firstOrCreate(['email' => 'operator@kemenag.go.id'], [
            'name' => 'Operator UPZ', 'password' => Hash::make('operator123'),
            'role' => 'Operator', 'active' => true, 'unit_kerja' => 'UPZ Kankemenag',
        ]);
        User::firstOrCreate(['email' => 'pimpinan@kemenag.go.id'], [
            'name' => 'Kepala Kantor', 'password' => Hash::make('pimpinan123'),
            'role' => 'Pimpinan', 'active' => true, 'nip' => '196801012000011001',
        ]);
        User::firstOrCreate(['email' => 'auditor@kemenag.go.id'], [
            'name' => 'Auditor Internal', 'password' => Hash::make('auditor123'),
            'role' => 'Auditor', 'active' => true,
        ]);

        // Bank Accounts
        BankAccount::firstOrCreate(['account_number' => '7116669091'], [
            'type' => 'upz', 'bank_name' => 'Bank Syariah Indonesia (BSI)',
            'account_holder' => 'UPZ Kankemenag Kab. Kebumen', 'description' => 'Rekening utama UPZ',
        ]);
        BankAccount::firstOrCreate(['account_number' => '5027127127'], [
            'type' => 'baznas', 'bank_name' => 'Bank Jateng Syariah',
            'account_holder' => 'BAZNAS Kabupaten Kebumen', 'description' => 'Rekening setoran ke BAZNAS',
        ]);

        // Sample Muzakki
        $muzakkiData = [
            ['nik'=>'3305010101800001','name'=>'Ahmad Fauzi','phone'=>'081234567890','type'=>'individu','nip'=>'197001011998031001','unit_kerja'=>'Kankemenag Kab. Kebumen','golongan'=>'IV/a','status'=>'Muzakki'],
            ['nik'=>'3305010202850002','name'=>'Siti Rahayu','phone'=>'081234567891','type'=>'individu','nip'=>'198502022010012001','unit_kerja'=>'MTsN Kebumen','golongan'=>'III/c','status'=>'Muzakki'],
            ['nik'=>'3305010303900003','name'=>'Budi Santoso','phone'=>'081234567892','type'=>'individu','nip'=>'199003032015031001','unit_kerja'=>'KUA Kebumen','golongan'=>'III/a','status'=>'Keduanya'],
            ['name'=>'ASN Kemenag Rombongan','phone'=>'02876789000','type'=>'badan_usaha','unit_kerja'=>'Kankemenag Kab. Kebumen','status'=>'Muzakki'],
        ];
        foreach ($muzakkiData as $m) Muzakki::firstOrCreate(['name' => $m['name']], $m);

        // Sample Mustahik
        $mustahikData = [
            ['name'=>'Desa Arjomulyo','asnaf'=>'fakir','type'=>'lembaga','address'=>'Desa Arjomulyo, Kec. Kebumen'],
            ['name'=>'Panti Asuhan Nurul Huda','asnaf'=>'miskin','type'=>'lembaga','address'=>'Jl. Pemuda No. 5, Kebumen'],
            ['name'=>'Guru Ngaji Slamet','nik'=>'3305015050700001','asnaf'=>'fisabilillah','type'=>'individu','address'=>'RT 03/02 Ds. Jatimulyo'],
            ['name'=>'Pondok Pesantren Al-Falah','asnaf'=>'fisabilillah','type'=>'lembaga','address'=>'Kec. Gombong, Kebumen'],
            ['name'=>'Mualaf Binaan UPZ','asnaf'=>'muallaf','type'=>'individu','address'=>'Ds. Kutowinangun'],
        ];
        foreach ($mustahikData as $m) Mustahik::firstOrCreate(['name' => $m['name']], $m);

        // Sample Programs
        $programs = [
            ['name'=>'Beasiswa Yatim & Dhuafa','fund_type'=>'infaq_terikat','target_amount'=>60000000,'description'=>'Bantuan biaya pendidikan anak yatim dan dhuafa','bidang'=>'Pendidikan','waktu_kegiatan'=>'Tahunan'],
            ['name'=>'Santunan Fakir Miskin','fund_type'=>'zakat','target_amount'=>120000000,'description'=>'Distribusi zakat untuk fakir dan miskin','bidang'=>'Kemanusiaan','waktu_kegiatan'=>'Bulanan'],
            ['name'=>'Operasional Kantor LAZ','fund_type'=>'amil','target_amount'=>18000000,'description'=>'Biaya operasional lembaga amil','waktu_kegiatan'=>'Tahunan'],
            ['name'=>'Bantuan Rumah Ibadah','fund_type'=>'infaq_terikat','target_amount'=>50000000,'description'=>'Perbaikan masjid dan mushola','bidang'=>'Dakwah-Advokasi','waktu_kegiatan'=>'Insidental'],
        ];
        foreach ($programs as $p) Program::firstOrCreate(['name' => $p['name']], $p);

        // Sample Collection Plans
        $plans = [
            ['name'=>'Zakat Gaji ASN Kemenag','category'=>'zakat_mal','target_amount'=>900000000,'unit_amount'=>2500000,'multiplier'=>12,'multiplier_label'=>'bulan','period'=>'Tahun Buku 2026','description'=>'Target zakat penghasilan bulanan ASN','setor_baznas'=>true,'baznas_return_percentage'=>12.5],
            ['name'=>'Zakat TPG/Tukin PNS','category'=>'zakat_mal','target_amount'=>150000000,'unit_amount'=>5000000,'multiplier'=>4,'multiplier_label'=>'triwulan','period'=>'Tahun Buku 2026','description'=>'Zakat tunjangan profesi guru & tukin','setor_baznas'=>true,'baznas_return_percentage'=>12.5],
            ['name'=>'Zakat Fitrah Ramadhan','category'=>'zakat_fitrah','target_amount'=>50000000,'unit_amount'=>40000,'multiplier'=>1250,'multiplier_label'=>'jiwa','period'=>'Ramadhan 2026','description'=>'Target zakat fitrah Ramadhan 1447H','setor_baznas'=>true],
            ['name'=>'Infak & Sedekah Umum','category'=>'infaq_umum','target_amount'=>30000000,'period'=>'Tahun Buku 2026','description'=>'Penghimpunan infak dan sedekah sukarela','setor_baznas'=>false],
        ];
        foreach ($plans as $p) CollectionPlan::firstOrCreate(['name' => $p['name']], $p);

        // App Settings
        $settings = [
            ['key'=>'upz_name','value'=>'UPZ P Kankemenag Kab. Kebumen','label'=>'Nama UPZ','group'=>'identitas'],
            ['key'=>'upz_address','value'=>'Jl. Pahlawan No. 123, Kebumen, Jawa Tengah','label'=>'Alamat','group'=>'identitas'],
            ['key'=>'upz_phone','value'=>'(0287) 381101','label'=>'Telepon','group'=>'identitas'],
            ['key'=>'baznas_name','value'=>'BAZNAS Kabupaten Kebumen','label'=>'Nama BAZNAS','group'=>'identitas'],
            ['key'=>'fiscal_year','value'=>'2026','label'=>'Tahun Buku','group'=>'sistem'],
            ['key'=>'amil_max_percentage','value'=>'12.5','label'=>'Batas Amil (%)','group'=>'sistem'],
            ['key'=>'nisab_mal','value'=>'85','label'=>'Nisab Zakat Mal (gram emas)','group'=>'zakat'],
            ['key'=>'gold_price_per_gram','value'=>'1500000','label'=>'Harga Emas/gram (Rp)','group'=>'zakat'],
            ['key'=>'zakat_fitrah_rice_kg','value'=>'2.5','label'=>'Zakat Fitrah (kg beras)','group'=>'zakat'],
            ['key'=>'zakat_fitrah_cash','value'=>'40000','label'=>'Zakat Fitrah Uang (Rp)','group'=>'zakat'],
        ];
        foreach ($settings as $s) AppSetting::firstOrCreate(['key' => $s['key']], $s);

        // Sample Transactions
        $admin = User::where('email', 'admin@kemenag.go.id')->first();
        $muzakki1 = Muzakki::where('name', 'Ahmad Fauzi')->first();
        $plan1 = CollectionPlan::where('name', 'like', '%Zakat Gaji%')->first();

        if ($admin && $muzakki1 && $plan1 && Transaction::count() === 0) {
            $months = [1,2,3,4,5,6,7,8];
            foreach ($months as $month) {
                Transaction::create([
                    'reference_number' => sprintf('BKM-2026-%04d', $month),
                    'date' => "2026-{$month}-15",
                    'type' => 'penerimaan',
                    'fund_type' => 'zakat',
                    'amount' => rand(8000000, 15000000),
                    'payment_method' => 'bank',
                    'bank_name' => 'BSI',
                    'party_name' => 'ASN Kemenag',
                    'muzakki_id' => $muzakki1->id,
                    'collection_plan_id' => $plan1->id,
                    'collection_plan_name' => $plan1->name,
                    'zakat_type' => 'mal_penghasilan',
                    'description' => "Zakat Gaji ASN Kemenag Bulan ke-{$month} Tahun 2026",
                    'status' => 'Disetujui',
                    'created_by' => $admin->id,
                    'approved_by' => $admin->id,
                ]);
            }
        }

        $this->command->info('✅ Seeder selesai! User: admin@kemenag.go.id / admin123');
    }
}
