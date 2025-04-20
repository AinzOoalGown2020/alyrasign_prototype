import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { AlyraSign } from "../target/types/alyra_sign";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import { expect } from "chai";

describe("alyra_sign", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = new Program<AlyraSign>(
    require("../target/idl/alyra_sign.json"),
    new PublicKey("v69C2KjiWjhUcRTKuotEY1E1PykP4oUtFaBE8ZCg5yJ"),
    provider
  );
  
  const authority = provider.wallet;
  const student = Keypair.generate();
  const formationId = new anchor.BN(1);
  const sessionId = new anchor.BN(1);
  
  let registry: PublicKey;
  let formation: PublicKey;
  let session: PublicKey;
  let studentAccount: PublicKey;
  let userRole: PublicKey;

  before(async () => {
    // Airdrop SOL to student
    const signature = await provider.connection.requestAirdrop(student.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(signature);
  });

  it("Creates registry", async () => {
    [registry] = PublicKey.findProgramAddressSync(
      [Buffer.from("alyra_sign"), authority.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .createRegistry()
      .accounts({
        registry,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const registryAccount = await program.account.registry.fetch(registry);
    expect(registryAccount.authority.toString()).to.equal(authority.publicKey.toString());
    expect(registryAccount.formationsCount.toNumber()).to.equal(0);
  });

  it("Creates formation", async () => {
    [formation] = PublicKey.findProgramAddressSync(
      [Buffer.from("formation"), formationId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const title = "Formation Solana";
    const description = "Apprenez à développer sur Solana";
    const startDate = new anchor.BN(Math.floor(Date.now() / 1000));
    const endDate = new anchor.BN(Math.floor(Date.now() / 1000) + 86400 * 30); // 30 days from now

    await program.methods
      .createFormation(formationId, title, description, startDate, endDate)
      .accounts({
        formation,
        registry,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const formationAccount = await program.account.formation.fetch(formation);
    expect(formationAccount.title).to.equal(title);
    expect(formationAccount.description).to.equal(description);
    expect(formationAccount.authority.toString()).to.equal(authority.publicKey.toString());
  });

  it("Creates session", async () => {
    [session] = PublicKey.findProgramAddressSync(
      [Buffer.from("session"), formation.toBuffer(), sessionId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const title = "Introduction à Solana";
    const startAt = new anchor.BN(Math.floor(Date.now() / 1000));
    const endAt = new anchor.BN(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now

    await program.methods
      .createSession(sessionId, title, startAt, endAt)
      .accounts({
        session,
        formation,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const sessionAccount = await program.account.session.fetch(session);
    expect(sessionAccount.title).to.equal(title);
    expect(sessionAccount.authority.toString()).to.equal(authority.publicKey.toString());
  });

  it("Registers student", async () => {
    [studentAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("student"), formation.toBuffer(), student.publicKey.toBuffer()],
      program.programId
    );

    const firstName = "John";
    const lastName = "Doe";
    const email = "john.doe@example.com";

    await program.methods
      .registerStudent(firstName, lastName, email)
      .accounts({
        student: studentAccount,
        formation,
        studentWallet: student.publicKey,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const studentData = await program.account.student.fetch(studentAccount);
    expect(studentData.firstName).to.equal(firstName);
    expect(studentData.lastName).to.equal(lastName);
    expect(studentData.email).to.equal(email);
  });

  it("Sets user role", async () => {
    [userRole] = PublicKey.findProgramAddressSync(
      [Buffer.from("role"), student.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .setRole({ etudiant: {} })
      .accounts({
        userRole,
        registry,
        wallet: student.publicKey,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const roleAccount = await program.account.userRole.fetch(userRole);
    expect(roleAccount.wallet.toString()).to.equal(student.publicKey.toString());
    expect(roleAccount.role).to.deep.equal({ etudiant: {} });
  });

  it("Marks presence", async () => {
    await program.methods
      .markPresence()
      .accounts({
        session,
        student: studentAccount,
        studentWallet: student.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([student])
      .rpc();

    const sessionAccount = await program.account.session.fetch(session);
    expect(sessionAccount.presenceCount.toNumber()).to.equal(1);

    const studentData = await program.account.student.fetch(studentAccount);
    expect(studentData.presences.length).to.equal(1);
    expect(studentData.presences[0].isPresent).to.be.true;
  });
});
